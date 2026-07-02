from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI, OpenAIError

from app.config import Settings, get_settings
from app.schemas import PromptRequest, PromptResponse

app = FastAPI(
    title="AMP Hack API",
    description="Backend API for invoking the configured OpenAI GPT model.",
    version="0.1.0",
)


@app.on_event("startup")
def configure_cors() -> None:
    settings = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


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
        response = client.responses.create(
            model=settings.openai_model,
            input=request.prompt,
        )
    except OpenAIError as exc:
        raise HTTPException(status_code=502, detail="OpenAI request failed") from exc

    return PromptResponse(
        model=settings.openai_model,
        output_text=response.output_text,
    )
