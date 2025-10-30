from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from rag_pipeline.roadmap.models import Roadmap


class CurriculumGenerationRequest(BaseModel):
    """커리큘럼 생성 요청 (학생 맞춤형)"""
    
    subject: str = Field(..., description="학습 과목 (예: '수학', '영어')")
    grade: str = Field(..., description="학년 정보 (예: '중학교 3학년')")


class CurriculumNode(BaseModel):
    """커리큘럼 로드맵의 단일 노드"""
    
    title: str = Field(..., description="노드 제목")
    parent_id: Optional[int] = Field(None, description="부모 노드 ID (최상위는 null)")
    category: str = Field(
        ..., 
        description="노드 카테고리: 'subject'(과목) | 'title'(단원) | 'topic'(단원 관련 정보)"
    )
    duration: str = Field(..., description="예상 소요 기간 (예: '2주', '1개월')")
    description: str = Field(..., description="노드 상세 설명")
    
    # 검증
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed = {'subject', 'title', 'topic'}
        if v not in allowed:
            raise ValueError(f"category must be one of {allowed}")
        return v


class CurriculumGenerationResponse(BaseModel):
    """커리큘럼 생성 응답"""
    
    subject: str = Field(..., description="학습 과목")
    grade: str = Field(..., description="학년")
    roadmap_nodes: List[CurriculumNode] = Field(..., description="로드맵 노드 배열 (계층 구조)")
    metadata: Dict[str, Any] = Field(
        ...,
        description="메타 정보 (total_nodes, estimated_duration)"
    )


class MultipleChoiceOption(BaseModel):
    label: str | int
    text: str


class MultipleChoiceQuestion(BaseModel):
    question: str
    options: List[MultipleChoiceOption]
    answer: str | int
    explanation: str


class ProblemGenerationRequest(BaseModel):
    title: str = Field(..., description="원하는 문제 주제에 대한 키워드 또는 설명")
    grade: Optional[str] = Field(default=None, description="대상 학년 컨텍스트 (예: '중학교 2학년')")
    subject: Optional[str] = Field(default=None, description="대상 과목 컨텍스트 (예: '국어', '수학')")
    num_questions: int = Field(default=3, ge=1, le=10, description="생성할 문제 수 (기본값: 3, 범위: 1-10)")


class ProblemSetMetadata(BaseModel):
    title: Optional[str] = Field(None, description="세부 과목")
    grade: Optional[str] = Field(None, description="학년")
    subject: Optional[str] = Field(None, description="과목")


class ProblemGenerationResponse(BaseModel):
    passage: str
    questions: List[MultipleChoiceQuestion]
    metadata: ProblemSetMetadata


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's text prompt")


class ChatResponse(BaseModel):
    reply: str


class CurriculumUpdateRequest(BaseModel):
    """커리큘럼 업데이트 요청 (평가 결과 기반)"""
    
    subject: str = Field(..., description="학습 과목")
    grade: str = Field(..., description="학년")
    assessment_results: Dict[str, Any] = Field(..., description="성취도 평가 결과 데이터")
    roadmap_nodes: List[CurriculumNode] = Field(..., description="노드 배열 (계층 구조)")


class CurriculumUpdateResponse(BaseModel):
    """커리큘럼 업데이트 응답"""
    
    subject: str = Field(..., description="과목")
    grade: str = Field(..., description="학년")
    roadmap_nodes: List[CurriculumNode] = Field(..., description="노드 배열 (계층 구조)")
    metadata: Dict[str, Any] = Field(..., description="메타 정보 (total_nodes, estimated_duration)")


class FeedbackRequest(BaseModel):
    """AI 피드백 생성 요청"""
    
    assessment_results: Dict[str, Any] = Field(..., description="평가 결과 데이터")
    curriculum_context: Optional[Dict[str, Any]] = Field(None, description="커리큘럼 컨텍스트 (선택적)")


class FeedbackResponse(BaseModel):
    """AI 피드백 생성 응답"""
    
    feedback_summary: str = Field(..., description="1-2문장 요약 피드백")
    strengths: List[str] = Field(..., description="장점 목록 (잘한 점)")
    weaknesses: List[str] = Field(..., description="단점 목록 (개선 필요한 점)")
    recommendations: List[str] = Field(..., description="개선 방안 목록 (구체적인 학습 조언)")


class OCRSolveRequest(BaseModel):
    """OCR 기반 문제 풀이 요청"""

    image_name: str = Field(..., description="DATA_ROOTS 기준 상대 경로 또는 절대 경로 이미지 파일명")


class OCRSolutionDetail(BaseModel):
    """OCR 텍스트 기반 분석 및 풀이 결과"""

    problem_analysis: str = Field(..., description="문제 요약 및 핵심 요구 사항")
    solution_steps: List[str] = Field(..., description="풀이 과정을 단계별로 정리한 목록")
    final_answer: str = Field(..., description="최종 정답 또는 결론")
    concept_review: List[str] = Field(..., description="관련 핵심 개념 정리 (3~5개)")


class OCRSolveResponse(OCRSolutionDetail):
    """OCR 문제 풀이 응답"""

    image_name: str = Field(..., description="분석한 이미지 파일명")
    extracted_text: str = Field(..., description="OCR로 추출한 원문 텍스트")
