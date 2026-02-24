"""Vercel serverless entrypoint for SkillForge backend."""
import os
import sys

# Ensure `main.py` and sibling modules can be imported when running in /api.
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: E402,F401
