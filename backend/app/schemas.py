from pydantic import BaseModel, Field


class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=8000)


class FaqItem(BaseModel):
    id: int
    category: str
    question: str
    answer: str


class FaqCategory(BaseModel):
    category: str
    items: list[FaqItem]


class FaqResponse(BaseModel):
    categories: list[FaqCategory]
    total: int


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    limit: int = Field(6, ge=1, le=20)


class SearchHit(FaqItem):
    score: float


class SearchResponse(BaseModel):
    query: str
    hits: list[SearchHit]


class PromptResponse(BaseModel):
    model: str
    output_text: str
    sources: list[int] = Field(default_factory=list)
