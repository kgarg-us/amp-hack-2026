from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import (
    AuthenticationError,
    OpenAI,
    OpenAIError,
    RateLimitError,
)

from app.config import Settings, get_settings
from app.faq_context import load_faq_context
from app.faq_index import group_by_category, load_faq_items
from app.schemas import FaqResponse, PromptRequest, PromptResponse

app = FastAPI(
    title=get_settings().app_name,
    description="Backend API for the new-hire onboarding assistant.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in get_settings().frontend_origin.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_INSTRUCTIONS = """You are the onboarding assistant for new hires.
Answer using the New-Hire FAQ context below whenever it's relevant; if the \
question isn't covered by the context, answer from general onboarding best \
practices instead of refusing. Keep responses concise and summarized \
(prefer short paragraphs or bullet points over long prose). If asked for a \
structured plan (e.g. a first-week plan for a given person/role), format \
the answer as a clear day-by-day or section-by-section structure.

New-Hire FAQ context:
{context}
"""


def _client(settings: Settings) -> OpenAI:
    return OpenAI(api_key=settings.openai_api_key)


def _openai_http_error(exc: OpenAIError) -> HTTPException:
    """Translate an OpenAI SDK error into an actionable HTTP response."""
    if isinstance(exc, AuthenticationError):
        return HTTPException(
            status_code=502,
            detail="OpenAI authentication failed — check OPENAI_API_KEY.",
        )
    if isinstance(exc, RateLimitError):
        return HTTPException(
            status_code=502,
            detail="OpenAI quota or rate limit exceeded — check the account's "
            "plan and billing details.",
        )
    return HTTPException(status_code=502, detail="OpenAI request failed.")


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/faq", response_model=FaqResponse, tags=["faq"])
def list_faq(settings: Settings = Depends(get_settings)) -> FaqResponse:
    """Return the 50 structured FAQ entries grouped by category. The frontend
    searches these locally (no LLM) to find and answer questions."""
    items = load_faq_items(settings.faq_data_path)
    return FaqResponse(categories=group_by_category(items), total=len(items))


@app.post("/api/generate", response_model=PromptResponse, tags=["openai"])
def generate(
    request: PromptRequest,
    settings: Settings = Depends(get_settings),
) -> PromptResponse:
    """LLM endpoint used to generate the personalized first-week plan."""
    client = _client(settings)

    try:
        faq_context = load_faq_context(settings.faq_pdf_path)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500, detail="New-hire FAQ PDF is not available"
        ) from exc

    try:
        response = client.responses.create(
            model=settings.openai_model,
            instructions=SYSTEM_INSTRUCTIONS.format(context=faq_context),
            input=request.prompt,
        )
    except OpenAIError as exc:
        raise _openai_http_error(exc) from exc

    return PromptResponse(
        model=settings.openai_model,
        output_text=response.output_text,
    )
