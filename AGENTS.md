# Repository Guidelines

## Project Structure & Module Organization
This repository is split into two apps:

- `frontend/`: React + Vite + TypeScript UI.
- `backend/`: FastAPI API for skill generation, validation, and security scanning.
- `docs/plans/`: planning documents and feature specs.

Frontend code lives in `frontend/src/`:
- `components/` for UI blocks (`GenerateForm.tsx`, `SkillPreview.tsx`).
- `hooks/` for app logic (`useSkillGeneration.ts` SSE flow).

Backend code lives in `backend/`:
- `main.py` (API routes, CORS, middleware).
- `generator.py` (LLM streaming generation).
- `scanner.py` (static security checks).
- `api/index.py` (Vercel serverless entrypoint).
- `templates/*.yaml` (starter templates).

## Build, Test, and Development Commands
- `cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`: install backend dependencies.
- `cd backend && uvicorn main:app --reload --port 8000`: run backend locally.
- `cd frontend && npm install`: install frontend dependencies.
- `cd frontend && npm run dev`: run frontend at `http://localhost:5173`.
- `cd frontend && npm run build`: type-check and build production assets.
- `cd frontend && npm run lint`: run ESLint checks.
- `curl http://localhost:8000/api/health`: quick backend smoke check.

## Coding Style & Naming Conventions
- Python: 4-space indentation, PEP 8 style, `snake_case` for functions/variables.
- TypeScript/React: components in `PascalCase`, hooks as `useXxx`, locals in `camelCase`.
- Keep API contracts consistent (`template_id`, `risk_level`).
- Prefer focused modules over large mixed-purpose files.

## Testing Guidelines
Automated tests are not yet established. Minimum validation before PR:
- frontend lint passes (`npm run lint`);
- frontend build passes (`npm run build`);
- backend health endpoint responds (`/api/health`);
- manual generate + scan flow works end-to-end.

When adding tests:
- backend: `backend/tests/test_*.py` (pytest style).
- frontend: `*.test.tsx` colocated with components/hooks.

## Commit & Pull Request Guidelines
Use Conventional Commit style seen in history:
- `feat(frontend): ...`
- `feat(backend): ...`
- `fix: ...`
- `docs: ...`

PRs should include:
- concise summary and scope;
- linked issue/task;
- verification steps run locally;
- screenshots/GIFs for UI changes;
- env var changes (for example `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`) when applicable.
