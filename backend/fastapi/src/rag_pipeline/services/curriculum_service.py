from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List

from rag_pipeline.api.schemas import (
    CurriculumGenerationRequest,
    CurriculumGenerationResponse,
    CurriculumNode,
    CurriculumUpdateRequest,
    CurriculumUpdateResponse,
)
from rag_pipeline.prompting.loader import PromptLoader
from rag_pipeline.roadmap.builder import build_roadmap_from_contexts
from rag_pipeline.roadmap.models import Roadmap
from rag_pipeline.retrieval.pgvector import retrieve_passages
from rag_pipeline.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


class CurriculumService:
    """커리큘럼 생성 및 업데이트 서비스"""

    def __init__(self, retriever=retrieve_passages) -> None:
        self.retriever = retriever
        self.openai_client = get_openai_client()
        self.prompt_loader = PromptLoader()

    async def generate_curriculum(
        self, request: CurriculumGenerationRequest
    ) -> CurriculumGenerationResponse:
        """
        학생 맞춤형 커리큘럼을 생성합니다. (RAG 기반 벡터 DB 검색 활용)
        
        Args:
            request: 커리큘럼 생성 요청
            
        Returns:
            생성된 커리큘럼 정보
        """
        # 1. 벡터 DB에서 관련 학습 자료 검색
        contexts = self._retrieve_contexts(request)
        
        # 2. 검색된 자료를 기반으로 프롬프트 구성
        prompt_template = self.prompt_loader.load("curriculum_generation")
        
        # 검색된 컨텍스트를 프롬프트에 추가
        context_text = self._format_contexts(contexts) if contexts else "검색된 자료 없음"
        
        user_prompt = prompt_template["user"].format(
            subject=request.subject,
            grade=request.grade or "미지정",
            study_duration=request.study_duration or "6개월",
        )
        
        # 컨텍스트를 프롬프트에 추가
        user_prompt = f"### 검색된 학습 자료:\n{context_text}\n\n### 요청사항:\n{user_prompt}"
        
        system_prompt = prompt_template["system"]
        
        # 3. OpenAI API 호출
        response = self.openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=4000,
        )
        
        # 4. 응답 파싱
        content = response.choices[0].message.content
        nodes_data = json.loads(content)
        
        # 5. 노드 검증 및 변환
        roadmap_nodes = [CurriculumNode(**node) for node in nodes_data]
        
        # 최소 노드 수 검증
        if len(roadmap_nodes) < 30:
            logger.warning(
                f"Generated only {len(roadmap_nodes)} nodes, expected at least 30"
            )
        
        # 6. 메타데이터 생성 (검색된 자료 정보 포함)
        metadata = {
            "total_nodes": len(roadmap_nodes),
            "estimated_duration": request.study_duration or "6개월",
            "retrieved_contexts": len(contexts),
            "model_version": "gpt-4",
        }
        
        # 7. 응답 생성
        curriculum_id = f"curr-{uuid.uuid4()}"
        
        return CurriculumGenerationResponse(
            curriculum_id=curriculum_id,
            student_id=request.student_id,
            subject=request.subject,
            grade=request.grade,
            roadmap_nodes=roadmap_nodes,
            metadata=metadata,
        )
    
    def _retrieve_contexts(
        self, request: CurriculumGenerationRequest, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        벡터 DB에서 관련 학습 자료를 검색합니다.
        
        Args:
            request: 커리큘럼 생성 요청
            limit: 검색 개수
            
        Returns:
            검색된 학습 자료 목록
        """
        # 검색 쿼리 구성
        query_parts = [
            request.subject,
            request.grade or "",
        ]
        query = " ".join(part for part in query_parts if part).strip()
        
        try:
            contexts = self.retriever(
                query=query,
                grade=request.grade,
                subject=request.subject,
                limit=limit,
            )
            logger.info(f"Retrieved {len(contexts)} contexts for curriculum generation")
            return contexts
        except Exception as exc:
            logger.exception("Failed to retrieve contexts: %s", exc)
            return []
    
    def _format_contexts(self, contexts: List[Dict[str, Any]]) -> str:
        """
        검색된 컨텍스트를 프롬프트에 추가할 수 있는 형식으로 변환합니다.
        
        Args:
            contexts: 검색된 학습 자료 목록
            
        Returns:
            포맷팅된 컨텍스트 텍스트
        """
        if not contexts:
            return "검색된 학습 자료가 없습니다."
        
        formatted_parts = []
        for idx, ctx in enumerate(contexts, 1):
            title = ctx.get("title", "제목 없음")
            content = ctx.get("content", ctx.get("passage", "내용 없음"))
            achievement_code = ctx.get("achievement_code", "")
            
            part = f"[자료 {idx}] {title}"
            if achievement_code:
                part += f" (성취기준: {achievement_code})"
            part += f"\n{content}\n"
            
            formatted_parts.append(part)
        
        return "\n".join(formatted_parts)

    def update_curriculum(self, request: CurriculumUpdateRequest) -> CurriculumUpdateResponse:
        """
        성취도 평가 결과를 바탕으로 커리큘럼을 업데이트합니다.
        
        Args:
            request: 커리큘럼 업데이트 요청 (평가 결과 포함)
            
        Returns:
            업데이트된 커리큘럼 정보
        """
        logger.info(f"Updating curriculum {request.curriculum_id} based on assessment results")
        
        # 평가 결과 분석
        assessment_results = request.assessment_results
        weak_areas = self._analyze_weak_areas(assessment_results)
        
        logger.info(f"Identified weak areas: {weak_areas}")
        
        # 약점 영역에 대한 추가 학습 자료 검색
        contexts = self._retrieve_additional_contexts(
            weak_areas=weak_areas,
            grade=request.grade,
            subject=request.subject,
        )
        
        # 새로운 로드맵 생성
        updated_roadmap = build_roadmap_from_contexts(
            grade=request.grade,
            subject=request.subject,
            contexts=contexts,
        )
        
        # 변경 사항 요약 생성
        changes_summary = self._generate_changes_summary(weak_areas, contexts)
        
        logger.info(f"Successfully updated curriculum {request.curriculum_id}")
        
        return CurriculumUpdateResponse(
            curriculum_id=request.curriculum_id,
            changes_summary=changes_summary,
        )

    def _analyze_weak_areas(self, assessment_results: Dict[str, Any]) -> list[str]:
        """
        평가 결과에서 약점 영역을 분석합니다.
        
        Args:
            assessment_results: 평가 결과 데이터
            
        Returns:
            약점 영역 목록
        """
        # 간단한 분석 로직 (실제로는 더 정교하게 구현)
        weak_areas = []
        
        # 평가 결과에서 오답이 많은 영역 추출
        if "questions" in assessment_results:
            for question in assessment_results.get("questions", []):
                if not question.get("is_correct", False):
                    topic = question.get("topic", "기초 개념")
                    if topic not in weak_areas:
                        weak_areas.append(topic)
        
        # 기본값: 전반적인 복습이 필요한 경우
        if not weak_areas:
            weak_areas = ["전반적인 복습"]
        
        return weak_areas

    def _retrieve_additional_contexts(
        self,
        weak_areas: list[str],
        grade: str,
        subject: str,
        limit: int = 10,
    ) -> list[Dict[str, Any]]:
        """
        약점 영역에 대한 추가 학습 자료를 검색합니다.
        
        Args:
            weak_areas: 약점 영역 목록
            grade: 학년
            subject: 과목
            limit: 검색 개수
            
        Returns:
            검색된 학습 자료 목록
        """
        all_contexts = []
        
        for area in weak_areas:
            query = f"{grade} {subject} {area}"
            contexts = self.retriever(
                query=query,
                grade=grade,
                subject=subject,
                limit=limit // len(weak_areas) if weak_areas else limit,
            )
            all_contexts.extend(contexts)
        
        return all_contexts[:limit]

    def _generate_changes_summary(
        self,
        weak_areas: list[str],
        contexts: list[Dict[str, Any]],
    ) -> str:
        """
        커리큘럼 변경 사항 요약을 생성합니다.
        
        Args:
            weak_areas: 약점 영역 목록
            contexts: 추가된 학습 자료
            
        Returns:
            변경 사항 요약 텍스트
        """
        summary_parts = []
        
        if weak_areas:
            areas_text = ", ".join(weak_areas)
            summary_parts.append(f"약점 영역 ({areas_text})에 대한 보충 학습 자료를 추가했습니다.")
        
        if contexts:
            summary_parts.append(f"총 {len(contexts)}개의 추가 학습 자료가 포함되었습니다.")
        
        return " ".join(summary_parts) if summary_parts else "커리큘럼이 업데이트되었습니다."


def get_curriculum_service() -> CurriculumService:
    """커리큘럼 서비스 인스턴스를 반환합니다."""
    return CurriculumService()
