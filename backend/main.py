import json
import os
import sys
from typing import Optional

# Ensure local imports work in Vercel's runtime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load .env for local dev only (Vercel injects env vars natively)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from starlette.responses import JSONResponse

from generator import generate_skill_stream
from scanner import scan_skill_md

app = FastAPI(title="SkillForge API")

# Rate limiting: only enable if slowapi is available (not critical in serverless)
_limiter = None
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded

    _limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = _limiter

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Try again later."},
        )
except ImportError:
    pass

_allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]
_extra_origin = os.environ.get("CORS_ORIGIN")
if _extra_origin:
    _allowed_origins.extend(
        origin.strip().strip("'\"")
        for origin in _extra_origin.split(",")
        if origin.strip()
    )
_cors_origin_regex = os.environ.get("CORS_ORIGIN_REGEX", r"^https://.*\.vercel\.app$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class GenerateRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=5000)
    template_id: Optional[str] = None


class ScanRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)


@app.post("/api/generate")
async def generate_skill(request: Request, req: GenerateRequest):
    """SSE endpoint: stream skill generation + validation + security scan."""
    return StreamingResponse(
        generate_skill_stream(req.description, req.template_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/scan")
async def scan_skill(request: Request, req: ScanRequest):
    """Standalone scan endpoint: input SKILL.md content, output security report."""
    return scan_skill_md(req.content)


@app.get("/api/templates")
async def list_templates():
    """Return available skill templates."""
    templates_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
    templates = []
    if os.path.isdir(templates_dir):
        for fname in sorted(os.listdir(templates_dir)):
            if fname.endswith(".yaml") or fname.endswith(".yml"):
                import yaml
                fpath = os.path.join(templates_dir, fname)
                with open(fpath) as f:
                    data = yaml.safe_load(f)
                if data:
                    templates.append(data)
    return {"templates": templates}


@app.get("/api/health")
async def health():
    return {"status": "ok"}
