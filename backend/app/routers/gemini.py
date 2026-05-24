from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from google import genai
from pydantic import BaseModel

from app.dependencies import require_auth

router = APIRouter(prefix="/api/gemini", tags=["gemini"])


class ListModelsRequest(BaseModel):
    api_key: str


class GeminiModelInfo(BaseModel):
    name: str
    display_name: str
    description: str = ""
    supported_actions: list[str] = []


class ListModelsResponse(BaseModel):
    models: list[GeminiModelInfo]


@router.post("/list-models", response_model=ListModelsResponse)
def list_models(payload: ListModelsRequest, _: None = Depends(require_auth)):
    """Return models available to the supplied API key.

    Useful when a user's account has access to specific preview/new models
    that aren't in the default dropdown.
    """
    if not payload.api_key:
        raise HTTPException(status_code=400, detail="api_key is required")

    try:
        client = genai.Client(api_key=payload.api_key)
        models: list[GeminiModelInfo] = []
        for m in client.models.list():
            name = (getattr(m, "name", "") or "")
            if name.startswith("models/"):
                name = name[len("models/"):]

            actions: list[str] = []
            for attr in ("supported_actions", "supported_generation_methods"):
                val = getattr(m, attr, None)
                if val:
                    actions = list(val)
                    break

            models.append(
                GeminiModelInfo(
                    name=name,
                    display_name=getattr(m, "display_name", "") or name,
                    description=getattr(m, "description", "") or "",
                    supported_actions=actions,
                )
            )

        models.sort(key=lambda x: x.name)
        return ListModelsResponse(models=models)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to list Gemini models: {e}")
