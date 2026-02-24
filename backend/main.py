import json
import os
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.responses import JSONResponse

from generator import generate_skill_stream
from scanner import scan_skill_md

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="SkillForge API")
app.state.limiter = limiter

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded. Try again later."},
    )


class GenerateRequest(BaseModel):
    description: str = Field(..., min_length=1, max_length=5000)
    template_id: Optional[str] = None


class ScanRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)


@app.post("/api/generate")
@limiter.limit("10/minute")
async def generate_skill(request: Request, req: GenerateRequest):
    """SSE endpoint: stream skill generation + validation + security scan."""
    return StreamingResponse(
        generate_skill_stream(req.description, req.template_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/scan")
@limiter.limit("20/minute")
async def scan_skill(request: Request, req: ScanRequest):
    """Standalone scan endpoint: input SKILL.md content, output security report."""
    return scan_skill_md(req.content)


@app.get("/api/templates")
async def list_templates():
    """Return available skill templates."""
    templates_dir = os.path.join(os.path.dirname(__file__), "templates")
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
