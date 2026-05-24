from __future__ import annotations

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.image_storage import image_path

router = APIRouter(prefix="/api/images", tags=["images"])


@router.get("/{filename}")
def get_image(filename: str):
    """Serve generated images. Public endpoint (Slack needs to fetch this without auth)."""
    # Reject any path traversal attempt
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = image_path(filename)
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="Image not found")

    suffix = path.suffix.lower().lstrip(".")
    media = "image/png"
    if suffix in ("jpg", "jpeg"):
        media = "image/jpeg"
    elif suffix == "webp":
        media = "image/webp"
    return FileResponse(path, media_type=media)
