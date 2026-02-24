# SkillForge

Open-source AI skill generator for [OpenClaw](https://openclaw.org). Describe what you want your AI agent to do, get a working, security-scanned SKILL.md in seconds.

Built for the **SURGE x OpenClaw Hackathon 2026**.

**Live Demo**: [https://skillforge-frontend-gold.vercel.app](https://skillforge-frontend-gold.vercel.app)

## What It Does

1. **Describe** -- Type a natural language description of the skill you want
2. **Generate** -- LLM streams a valid SKILL.md with frontmatter + instructions
3. **Validate** -- Checks YAML frontmatter, required fields, format compliance
4. **Scan** -- Static security analysis (20+ rules) with risk scoring
5. **Install** -- Copy the install command, drop it into `~/.openclaw/skills/`

## Architecture

```
frontend/          React + Vite + TypeScript + Tailwind
  src/
    hooks/         useSkillGeneration (SSE streaming)
    components/    GenerateForm, SkillPreview, ScanResult

backend/           Python FastAPI
  main.py          API endpoints, CORS, rate limiting
  generator.py     LLM streaming via OpenAI-compatible API
  scanner.py       Static security scanner (regex rules + scoring)
  prompts.py       System prompt with safety rules + few-shot
  templates/       Quick-start YAML templates
```

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create .env with your LLM API credentials
cat > .env << 'EOF'
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o
EOF

uvicorn main:app --reload --port 8000
```

Any OpenAI-compatible API works (OpenAI, DeepSeek, Anthropic via proxy, etc).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173. Backend expected at http://localhost:8000.

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate` | POST | SSE stream: generates + validates + scans a SKILL.md |
| `/api/scan` | POST | Standalone security scan for any SKILL.md content |
| `/api/templates` | GET | List available quick-start templates |
| `/api/health` | GET | Health check |

### SSE Event Protocol

The `/api/generate` endpoint streams Server-Sent Events:

```
data: {"type": "phase", "phase": "generating"}
data: {"type": "token", "content": "---\n"}
data: {"type": "token", "content": "name: ..."}
...
data: {"type": "phase", "phase": "validating"}
data: {"type": "validation", "valid": true}
data: {"type": "phase", "phase": "scanning"}
data: {"type": "scan_result", "results": {"score": 95, "risk_level": "safe", ...}}
data: {"type": "done", "skill_md": "full content here"}
```

## Security Scanner

The built-in scanner checks for:
- Shell injection patterns (`rm -rf`, `eval`, backticks)
- Network exfiltration (`curl | sh`, suspicious URLs)
- Filesystem access to sensitive paths (`/etc/passwd`, `~/.ssh`)
- Privilege escalation (`sudo`, `chmod 777`)
- Credential exposure (API keys, tokens in plaintext)
- Blocked binaries (`nc`, `nmap`, `telnet`, etc.)

Each issue gets a severity (critical/high/medium/low) and contributes to an overall 0-100 safety score.

## SKILL.md Format

SkillForge generates skills in the OpenClaw SKILL.md format:

```yaml
---
name: my-skill
description: What this skill does
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - API_KEY_NAME
---

# Skill Title

## Instructions
Step-by-step instructions for the AI agent...

## Description
What this skill does and when to use it...

## Examples
Example interactions showing input/output...
```

## Tech Stack

- **Frontend**: React 19, Vite 5, TypeScript, Tailwind CSS 3
- **Backend**: Python, FastAPI, OpenAI SDK, PyYAML
- **Fonts**: Syne (display), DM Sans (body), JetBrains Mono (code)
- **Rate Limiting**: slowapi (10 req/min generate, 20 req/min scan)

## License

MIT
