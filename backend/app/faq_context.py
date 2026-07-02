from functools import lru_cache
from pathlib import Path

from pypdf import PdfReader


@lru_cache
def load_faq_context(pdf_path: Path) -> str:
    """Extract and cache the New-Hire FAQ text so the PDF is parsed only once."""
    reader = PdfReader(str(pdf_path))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n\n".join(page.strip() for page in pages if page.strip())
