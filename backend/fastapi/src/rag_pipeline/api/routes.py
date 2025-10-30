from __future__ import annotations

import asyncio
import json
import logging
from fastapi import APIRouter, Depends, HTTPException

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


@router.post("/curriculum/generate", response_model=CurriculumGenerationResponse)
async def generate_curriculum(
    payload: CurriculumGenerationRequest,
    service: CurriculumService = Depends(get_curriculum_service),
) -> CurriculumGenerationResponse:
    """학생 맞춤형 커리큘럼 생성"""
    try:
        return await service.generate_curriculum(payload)
    except json.JSONDecodeError as exc:
        logger.exception("Failed to parse LLM response for student=%s", payload.student_id)
        raise HTTPException(status_code=502, detail="LLM 응답 형식을 파싱하지 못했습니다") from exc
    except ValueError as exc:
        logger.exception("Invalid curriculum data for student=%s", payload.student_id)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate curriculum for student=%s", payload.student_id)
        raise HTTPException(status_code=500, detail="커리큘럼 생성 실패") from exc


@router.post("/assessment/generate", response_model=ProblemGenerationResponse)
async def generate_problem_set(
    payload: ProblemGenerationRequest,
    service: ProblemGenerationService = Depends(get_problem_service),
) -> ProblemGenerationResponse:
    try:
        return await asyncio.to_thread(service.generate, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate problem set for query=%s", payload.query)
        raise HTTPException(status_code=500, detail="Failed to generate problem set") from exc


@router.post("/chat", response_model=ChatResponse)
async def create_chat_turn(
    payload: ChatRequest,
    service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    try:
        return await service.generate_reply(payload)
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate chat reply")
        raise HTTPException(status_code=500, detail="Failed to generate chat reply") from exc


@router.post("/curriculum/update", response_model=CurriculumUpdateResponse)
async def update_curriculum(
    payload: CurriculumUpdateRequest,
    service: CurriculumService = Depends(get_curriculum_service),
) -> CurriculumUpdateResponse:
    """평가 결과 기반 커리큘럼 업데이트"""
    try:
        return await asyncio.to_thread(service.update_curriculum, payload)
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to update curriculum for curriculum_id=%s", payload.curriculum_id)
        raise HTTPException(status_code=500, detail="커리큘럼 업데이트 실패") from exc


@router.post("/feedback/generate", response_model=FeedbackResponse)
async def generate_feedback(
    payload: FeedbackRequest,
    service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackResponse:
    """AI 기반 학습 피드백 생성"""
    try:
        return await service.generate_feedback(payload)
    except Exception as exc:  # pragma: no cover - defensive logging
        logger.exception("Failed to generate feedback")
        raise HTTPException(status_code=500, detail="Failed to generate feedback") from exc
