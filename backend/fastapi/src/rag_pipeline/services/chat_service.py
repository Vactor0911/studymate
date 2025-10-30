from __future__ import annotations

import asyncio
import logging
from typing import Dict, List, Optional

from rag_pipeline.api.schemas import ChatRequest, ChatResponse
from rag_pipeline.config import settings
from rag_pipeline.services.openai_client import OpenAIChatClient

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self, *, client: Optional[OpenAIChatClient] = None) -> None:
        self.client = client or OpenAIChatClient()

    async def generate_reply(self, payload: ChatRequest) -> ChatResponse:
        has_api_key = bool(settings.openai_api_key)
        
        if has_api_key:
            try:
                reply = await asyncio.to_thread(self._call_model, payload)
            except Exception as exc:
                logger.exception("Chat completion failed")
                raise
        else:
            reply = self._stub_reply(payload)

        return ChatResponse(reply=reply)

    def _call_model(self, payload: ChatRequest) -> str:
        messages = self._build_messages(payload)
        return self.client.complete(messages)

    def _build_messages(self, payload: ChatRequest) -> List[Dict[str, str]]:
        return [{"role": "user", "content": payload.message}]

    def _stub_reply(self, payload: ChatRequest) -> str:
        return (
            f"[stub] 챗봇 응답입니다. 현재 OpenAI API 키가 설정되지 않아 "
            "실제 답변 대신 확인용 메시지를 반환합니다. 질문: " + payload.message
        )


def get_chat_service() -> ChatService:
    return ChatService()
