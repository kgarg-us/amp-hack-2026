# AMP Hack 2026

Full-stack starter with:

- `frontend/`: React + Node.js using Next.js for server-side rendering.
- `backend/`: Python FastAPI API with automatic OpenAPI and Swagger docs.
- OpenAI integration on the backend using a pre-configured model from environment variables.
- New-hire onboarding assistant: `/api/generate` grounds every answer in `backend/New_Hire_FAQ_Questions.pdf` (parsed once and cached) and returns a concise, summarized response — including structured first-week plans when asked (e.g. "generate a first-week plan for Alex, a Backend Engineer").

## Project Structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- __init__.py
|   |   |-- config.py
|   |   |-- main.py
|   |   `-- schemas.py
|   |-- .env.example
|   `-- requirements.txt
`-- frontend/
    |-- app/
    |   |-- globals.css
    |   |-- layout.tsx
    |   `-- page.tsx
    |-- components/
    |   `-- PromptForm.tsx
    |-- .env.example
    |-- next.config.mjs
    |-- package.json
    `-- tsconfig.json
```

## Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Set `OPENAI_API_KEY` and `OPENAI_MODEL` in `backend/.env`.

API docs:

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.
