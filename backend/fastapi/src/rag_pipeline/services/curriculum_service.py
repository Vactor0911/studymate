from __future__ import annotations

import json
import logging
from typing import Any, Dict, List

from rag_pipeline.api.schemas import (
    CurriculumGenerationRequest,
    CurriculumGenerationResponse,
    CurriculumNode,
    CurriculumUpdateRequest,
    CurriculumUpdateResponse,
)
from rag_pipeline.prompting.loader import PromptLoader
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
            grade=request.grade,
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
        
        # 6. 메타데이터 생성
        # 예상 기간 계산 (첫 번째 노드의 duration 사용 또는 기본값)
        estimated_duration = roadmap_nodes[0].duration if roadmap_nodes else "6개월"
        
        metadata = {
            "total_nodes": len(roadmap_nodes),
            "estimated_duration": estimated_duration,
        }
        
        # 7. 응답 생성
        return CurriculumGenerationResponse(
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
        query = f"{request.subject} {request.grade}"
        
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

    async def update_curriculum(self, request: CurriculumUpdateRequest) -> CurriculumUpdateResponse:
        """
        성취도 평가 결과를 바탕으로 커리큘럼을 업데이트합니다.
        
        Args:
            request: 커리큘럼 업데이트 요청 (평가 결과 포함)
            
        Returns:
            업데이트된 커리큘럼 정보
        """
        logger.info(f"Updating curriculum for {request.subject} {request.grade} based on assessment results")
        
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
        
        # 기존 노드에 새로운 노드 추가/수정
        updated_nodes = self._update_roadmap_nodes(
            existing_nodes=request.roadmap_nodes,
            weak_areas=weak_areas,
            contexts=contexts,
        )
        
        # 메타데이터 생성
        estimated_duration = updated_nodes[0].duration if updated_nodes else "6개월"
        metadata = {
            "total_nodes": len(updated_nodes),
            "estimated_duration": estimated_duration,
        }
        
        logger.info(f"Successfully updated curriculum for {request.subject} {request.grade}")
        
        return CurriculumUpdateResponse(
            subject=request.subject,
            grade=request.grade,
            roadmap_nodes=updated_nodes,
            metadata=metadata,
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

    def _update_roadmap_nodes(
        self,
        existing_nodes: List[CurriculumNode],
        weak_areas: list[str],
        contexts: list[Dict[str, Any]],
    ) -> List[CurriculumNode]:
        """
        기존 로드맵 노드를 평가 결과에 따라 업데이트합니다.
        
        Args:
            existing_nodes: 기존 노드 목록
            weak_areas: 약점 영역 목록
            contexts: 추가된 학습 자료
            
        Returns:
            업데이트된 노드 목록
        """
        # 기존 노드를 복사하여 시작
        updated_nodes = existing_nodes.copy()
        
        # 약점 영역에 대한 새로운 노드 추가 (간단한 구현)
        if weak_areas and contexts:
            # 첫 번째 노드의 parent_id를 사용 (일반적으로 1)
            parent_id = 1
            
            for area in weak_areas[:3]:  # 최대 3개 영역만 추가
                new_node = CurriculumNode(
                    title=f"{area} 보충 학습",
                    parent_id=parent_id,
                    category="topic",
                    duration="1주",
                    description=f"{area}에 대한 추가 학습이 필요합니다.",
                )
                updated_nodes.append(new_node)
        
        return updated_nodes


def get_curriculum_service() -> CurriculumService:
    """커리큘럼 서비스 인스턴스를 반환합니다."""
    return CurriculumService()
