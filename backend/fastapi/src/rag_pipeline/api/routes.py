from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from rag_pipeline.services.chat_service import ChatService, get_chat_service
from rag_pipeline.services.curriculum_service import CurriculumService, get_curriculum_service
from rag_pipeline.services.feedback_service import FeedbackService, get_feedback_service
from rag_pipeline.services.problem_service import ProblemGenerationService, get_problem_service

from .schemas import (
    ChatRequest,
    ChatResponse,
    CurriculumGenerationRequest,
    CurriculumGenerationResponse,
    CurriculumUpdateRequest,
    CurriculumUpdateResponse,
    FeedbackRequest,
    FeedbackResponse,
    ProblemGenerationRequest,
    ProblemGenerationResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["rag"])


def _json_text_response(payload: BaseModel | dict[str, Any], filename: str) -> PlainTextResponse:
    if isinstance(payload, BaseModel):
        data = payload.model_dump()
    else:
        data = payload

    content = json.dumps(data, ensure_ascii=False, indent=2)

    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return PlainTextResponse(content=content, media_type="text/plain; charset=utf-8", headers=headers)


@router.post(
    "/curriculum/generate",
    response_model=CurriculumGenerationResponse,
    response_class=PlainTextResponse,
)
async def generate_curriculum(
    payload: CurriculumGenerationRequest,
    service: CurriculumService = Depends(get_curriculum_service),
) -> PlainTextResponse:
    """학생 맞춤형 커리큘럼 생성 (RAG 기반 벡터 DB 검색 활용)"""
    try:
        result = await service.generate_curriculum(payload)
        return _json_text_response(result, "curriculum.txt")
    except json.JSONDecodeError as exc:
        logger.exception("Failed to parse LLM response for subject=%s, grade=%s", payload.subject, payload.grade)
        raise HTTPException(status_code=502, detail="LLM 응답 형식을 파싱하지 못했습니다") from exc
    except ValueError as exc:
        logger.exception("Invalid curriculum data for subject=%s, grade=%s", payload.subject, payload.grade)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate curriculum for subject=%s, grade=%s", payload.subject, payload.grade)
        raise HTTPException(status_code=500, detail="커리큘럼 생성 실패") from exc


@router.post(
    "/assessment/generate",
    response_model=ProblemGenerationResponse,
    response_class=PlainTextResponse,
)
async def generate_problem_set(
    payload: ProblemGenerationRequest,
    service: ProblemGenerationService = Depends(get_problem_service),
) -> PlainTextResponse:
    """주어진 주제와 학년/과목 정보를 기반으로 객관식 문제 세트를 자동 생성"""
    try:
        result = await asyncio.to_thread(service.generate, payload)
        return _json_text_response(result, "problems.txt")
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate problem set for title=%s", payload.title)
        raise HTTPException(status_code=500, detail="Failed to generate problem set") from exc


@router.post("/chat", response_model=ChatResponse, response_class=PlainTextResponse)
async def create_chat_turn(
    payload: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> PlainTextResponse:
    try:
        result = await service.generate_reply(payload)
        return _json_text_response(result, "chat.txt")
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate chat reply")
        raise HTTPException(status_code=500, detail="Failed to generate chat reply") from exc


@router.post(
    "/curriculum/update",
    response_model=CurriculumUpdateResponse,
    response_class=PlainTextResponse,
)
async def update_curriculum(
    payload: CurriculumUpdateRequest,
    service: CurriculumService = Depends(get_curriculum_service),
) -> PlainTextResponse:
    """성취도 평가 결과를 바탕으로 커리큘럼을 자동으로 수정하여 반환"""
    try:
        result = await service.update_curriculum(payload)
        return _json_text_response(result, "curriculum-update.txt")
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to update curriculum for subject=%s, grade=%s", payload.subject, payload.grade)
        raise HTTPException(status_code=500, detail="커리큘럼 업데이트 실패") from exc


@router.post(
    "/feedback/generate",
    response_model=FeedbackResponse,
    response_class=PlainTextResponse,
)
async def generate_feedback(
    payload: FeedbackRequest,
    service: FeedbackService = Depends(get_feedback_service),
) -> PlainTextResponse:
    """AI 기반 학습 피드백 생성"""
    try:
        result = await service.generate_feedback(payload)
        return _json_text_response(result, "feedback.txt")
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate feedback")
        raise HTTPException(status_code=500, detail="Failed to generate feedback") from exc
