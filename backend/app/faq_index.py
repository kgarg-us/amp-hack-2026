"""Structured FAQ loading and grouping. The 50 Q&As are served as-is via
/api/faq; searching happens client-side in the frontend (no LLM)."""

import json
from functools import lru_cache
from pathlib import Path


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
