from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError

from app.config import Settings, get_settings
from app.faq_context import load_faq_context
from app.schemas import PromptRequest, PromptResponse

app = FastAPI(
    title=get_settings().app_name,
    description="Backend API for invoking the configured OpenAI GPT model.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().frontend_origin],
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


@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/generate", response_model=PromptResponse, tags=["openai"])
def generate(
    request: PromptRequest,
    settings: Settings = Depends(get_settings),
) -> PromptResponse:
    client = OpenAI(api_key=settings.openai_api_key)

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
        raise HTTPException(status_code=502, detail="OpenAI request failed") from exc

    return PromptResponse(
        model=settings.openai_model,
        output_text=response.output_text,
    )