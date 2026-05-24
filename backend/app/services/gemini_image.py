from __future__ import annotations

from typing import List

from google import genai
from google.genai import types


def build_image_prompt(keywords: List[str], articles: List[dict]) -> str:
    """Build a prompt for generating a header image for the news summary."""
    topic_seed = ", ".join(keywords) if keywords else "today's news"
    headline_seed = ""
    if articles:
        titles = [a.get("title", "") for a in articles[:3] if a.get("title")]
        if titles:
            headline_seed = f"\nKey headlines: {' / '.join(titles)}"

    return (
        f"Create a modern, clean editorial thumbnail illustration representing news about: {topic_seed}.\n"
        f"Style: minimal, professional, abstract, suitable as a Slack message header image."
        f"{headline_seed}"
    )


def generate_image(prompt: str, api_key: str, model_name: str) -> bytes:
    """Generate an image with the Gemini image model. Returns raw image bytes."""
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
        ),
    )

    for candidate in response.candidates or []:
        content = getattr(candidate, "content", None)
        if not content:
            continue
        for part in getattr(content, "parts", None) or []:
            inline = getattr(part, "inline_data", None)
            data = getattr(inline, "data", None) if inline else None
            if data:
                return data if isinstance(data, (bytes, bytearray)) else bytes(data)

    raise RuntimeError("Gemini did not return image data in the response")
