import json
import os
from typing import Optional

from openai import AsyncOpenAI

from prompts import SYSTEM_PROMPT, FEW_SHOT_EXAMPLE
from scanner import validate_skill_md, scan_skill_md

_api_key = os.environ.get("LLM_API_KEY", "")
_base_url = os.environ.get("LLM_BASE_URL", "https://newapi.deepwisdom.ai/v1")
_model = os.environ.get("LLM_MODEL", "deepseek-chat")

_client = AsyncOpenAI(api_key=_api_key, base_url=_base_url)


async def generate_skill_stream(description: str, template_id: Optional[str] = None):
    """Generate a SKILL.md via streaming SSE, then validate and scan.

    Yields SSE-formatted strings:
      data: {"type": "phase", "phase": "generating"}
      data: {"type": "token", "content": "..."}
      data: {"type": "phase", "phase": "validating"}
      data: {"type": "validation", "valid": true/false, "error": "..."}
      data: {"type": "phase", "phase": "scanning"}
      data: {"type": "scan_result", "results": {...}}
      data: {"type": "done", "skill_md": "..."}
    """
    yield _sse({"type": "phase", "phase": "generating"})

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": FEW_SHOT_EXAMPLE},
        {"role": "assistant", "content": "I understand the format. Please provide the next skill description."},
        {"role": "user", "content": f"Create a skill: {description}"},
    ]

    if template_id:
        messages[-1]["content"] += f"\n\nUse the '{template_id}' template as a starting point."

    accumulated = []
    try:
        stream = await _client.chat.completions.create(
            model=_model,
            max_tokens=4096,
            messages=messages,
            stream=True,
        )
        async for chunk in stream:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta
            if delta and delta.content:
                accumulated.append(delta.content)
                yield _sse({"type": "token", "content": delta.content})
    except Exception as e:
        yield _sse({"type": "error", "content": f"LLM generation failed: {str(e)}"})
        return

    full_skill_md = "".join(accumulated)

    # Validate YAML frontmatter
    yield _sse({"type": "phase", "phase": "validating"})
    valid, error = validate_skill_md(full_skill_md)

    if not valid:
        # Retry once with fix prompt
        yield _sse({"type": "validation", "valid": False, "error": error, "retrying": True})
        retry_result = await _retry_fix(full_skill_md, error)
        if retry_result:
            full_skill_md = retry_result
            valid, error = validate_skill_md(full_skill_md)

    yield _sse({"type": "validation", "valid": valid, "error": error if not valid else None})

    if not valid:
        yield _sse({"type": "error", "content": f"Generated SKILL.md is invalid after retry: {error}"})
        return

    # Static security scan
    yield _sse({"type": "phase", "phase": "scanning"})
    scan_results = scan_skill_md(full_skill_md)
    yield _sse({"type": "scan_result", "results": scan_results})

    yield _sse({"type": "done", "skill_md": full_skill_md})


async def _retry_fix(skill_md: str, error: str) -> Optional[str]:
    """Ask LLM to fix invalid YAML. Returns corrected content or None."""
    try:
        response = await _client.chat.completions.create(
            model=_model,
            max_tokens=4096,
            messages=[
                {"role": "system", "content": "Fix the YAML frontmatter in this SKILL.md. Output ONLY the corrected SKILL.md. No explanations."},
                {"role": "user", "content": f"This SKILL.md has an error: {error}\n\nContent:\n{skill_md}"},
            ],
        )
        return response.choices[0].message.content
    except Exception:
        return None


def _sse(data: dict) -> str:
    """Format a dict as an SSE data line."""
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"
