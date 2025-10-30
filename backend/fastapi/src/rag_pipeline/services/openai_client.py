from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from openai import OpenAI

from rag_pipeline.config import settings

logger = logging.getLogger(__name__)


class OpenAIJSONClient:
    """Simple wrapper around OpenAI Responses API expecting JSON objects."""

    def __init__(self, model: Optional[str] = None) -> None:
        self.model = model or settings.openai_model
        self._client = OpenAI()

    def complete_json(self, system_prompt: str, user_text: str) -> Dict[str, Any]:
        if hasattr(self._client, "responses"):
            response = self._client.responses.create(
                model=self.model,
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": [{"type": "text", "text": user_text}]},
                ],
                response_format={"type": "json_object"},
            )

            try:
                content = response.output[0].content[0].text  # type: ignore[attr-defined]
            except Exception:  # pragma: no cover - defensive logging
                logger.error("Unexpected OpenAI response payload: %s", response)
                raise
        else:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_text},
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            content = completion.choices[0].message.content

        if isinstance(content, str):
            import json

            return json.loads(content)

        raise TypeError(f"Unexpected content type from OpenAI response: {content!r}")


class OpenAIChatClient:
    """Wrapper around Chat Completions API for free-form assistant replies."""

    def __init__(self, model: Optional[str] = None, temperature: float = 0.7) -> None:
        self.model = model or settings.openai_model
        self.temperature = temperature
        self._client = OpenAI()

    def complete(self, messages: List[Dict[str, str]]) -> str:
        response = self._client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
        )
        try:
            message = response.choices[0].message
            if message.content:
                return message.content
        except Exception:  # pragma: no cover - defensive branch
            logger.exception("Unexpected chat completion payload: %s", response)
            raise

        logger.error("Empty chat completion response: %s", response)
        raise ValueError("Empty chat completion response")


def get_openai_client() -> OpenAI:
    """OpenAI 클라이언트 인스턴스를 반환합니다."""
    return OpenAI(api_key=settings.openai_api_key)
