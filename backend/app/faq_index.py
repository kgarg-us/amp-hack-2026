"""Semantic FAQ index: embeds the structured FAQ once and ranks items by
cosine similarity against a user query. Pure-Python math, no numpy dependency."""

import json
import math
from functools import lru_cache
from pathlib import Path

from openai import OpenAI


@lru_cache
def load_faq_items(path: Path) -> tuple[dict, ...]:
    """Load and cache the structured FAQ so the JSON is parsed only once."""
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)
    return tuple(data)


def group_by_category(items: tuple[dict, ...]) -> list[dict]:
    """Group items by category, preserving first-seen category order."""
    order: list[str] = []
    buckets: dict[str, list[dict]] = {}
    for item in items:
        category = item["category"]
        if category not in buckets:
            buckets[category] = []
            order.append(category)
        buckets[category].append(item)
    return [{"category": name, "items": buckets[name]} for name in order]


def _embed(client: OpenAI, model: str, texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(model=model, input=texts)
    return [record.embedding for record in response.data]


def _normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector)) or 1.0
    return [value / norm for value in vector]


class FaqIndex:
    """Holds the FAQ items alongside their L2-normalized embedding vectors so
    ranking a query reduces to a dot product."""

    def __init__(self, items: list[dict], vectors: list[list[float]]) -> None:
        self.items = items
        self.vectors = vectors

    def search(
        self, client: OpenAI, model: str, query: str, limit: int
    ) -> list[dict]:
        query_vector = _normalize(_embed(client, model, [query])[0])
        scored: list[dict] = []
        for item, vector in zip(self.items, self.vectors):
            score = sum(a * b for a, b in zip(query_vector, vector))
            scored.append({**item, "score": round(score, 4)})
        scored.sort(key=lambda hit: hit["score"], reverse=True)
        return scored[:limit]


_INDEX: FaqIndex | None = None


def get_faq_index(
    client: OpenAI, embedding_model: str, data_path: Path
) -> FaqIndex:
    """Build the embedding index once on first use, then reuse it in-memory."""
    global _INDEX
    if _INDEX is None:
        items = list(load_faq_items(data_path))
        texts = [
            f"Category: {item['category']}\n"
            f"Q: {item['question']}\n"
            f"A: {item['answer']}"
            for item in items
        ]
        vectors = [_normalize(vector) for vector in _embed(client, embedding_model, texts)]
        _INDEX = FaqIndex(items, vectors)
    return _INDEX
