from __future__ import annotations

import uuid
from pathlib import Path

from app.config import settings


def _images_dir() -> Path:
    path = Path(settings.data_dir) / "images"
    path.mkdir(parents=True, exist_ok=True)
    return path


def save_image(image_bytes: bytes, ext: str = "png") -> str:
    """Persist image bytes under data/images and return the filename."""
    filename = f"{uuid.uuid4()}.{ext}"
    (_images_dir() / filename).write_bytes(image_bytes)
    return filename


def image_path(filename: str) -> Path:
    return _images_dir() / filename


def public_image_url(filename: str) -> str | None:
    """Build a publicly accessible URL for the image, or None if PUBLIC_BASE_URL is unset."""
    if not settings.public_base_url:
        return None
    base = settings.public_base_url.rstrip("/")
    return f"{base}/api/images/{filename}"
