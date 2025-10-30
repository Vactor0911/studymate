from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from rag_pipeline.roadmap.models import Roadmap


class CurriculumGenerationRequest(BaseModel):
    """커리큘럼 생성 요청 (학생 맞춤형)"""
    
    # 필수 필드
    student_id: str = Field(..., description="학생 고유 ID")
    subject: str = Field(..., description="학습 과목 (예: '수학', '영어', '과학')")
    
    # 선택 필드
    grade: Optional[str] = Field(
        None, 
        description="학년 정보 (예: '중학교 2학년')"
    )
    study_duration: Optional[str] = Field(
        None, 
        description="희망 학습 기간 (예: '3개월', '6개월', '1년')"
    )


class CurriculumNode(BaseModel):
    """커리큘럼 로드맵의 단일 노드"""
    
    id: int = Field(..., description="노드 ID (1부터 시작)")
    title: str = Field(..., description="노드 제목 (예: '일차방정식 기초')")
    parent_id: Optional[int] = Field(None, description="부모 노드 ID (최상위는 null)")
    is_optional: bool = Field(False, description="선택 과정 여부")
    category: str = Field(
        ..., 
        description="노드 카테고리: 'subject' | 'stage' | 'topic' | 'skill'"
    )
    duration: str = Field(..., description="예상 소요 기간 (예: '1주', '2주', '1개월')")
    description: str = Field(..., description="노드 상세 설명 (1-2문장)")
    
    # 검증
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        allowed = {'subject', 'stage', 'topic', 'skill'}
        if v not in allowed:
            raise ValueError(f"category must be one of {allowed}")
        return v


class CurriculumGenerationResponse(BaseModel):
    """커리큘럼 생성 응답"""
    
    curriculum_id: str = Field(..., description="커리큘럼 고유 ID")
    student_id: str = Field(..., description="학생 ID")
    subject: str = Field(..., description="학습 과목")
    grade: Optional[str] = Field(None, description="학년")
    
    # 로드맵 데이터
    roadmap_nodes: List[CurriculumNode] = Field(..., description="로드맵 노드 배열")
    
    # 메타데이터
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="추가 정보 (total_nodes, estimated_duration 등)"
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
    query: str = Field(..., description="Keyword or description for the desired question theme")
    grade: Optional[str] = Field(default=None, description="Target grade context")
    subject: Optional[str] = Field(default=None, description="Target subject context")
    sub_subject: Optional[str] = Field(default=None, description="Optional sub subject filter")
    num_questions: int = Field(default=3, ge=1, le=10)
    num_choices: int = Field(default=4, ge=3, le=5)
    retrieval_limit: int = Field(default=5, ge=1, le=10)


class ProblemSetMetadata(BaseModel):
    grade: Optional[str]
    subject: Optional[str]
    sub_subject: Optional[str]
    source_ids: List[str] = Field(default_factory=list)


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
    
    curriculum_id: str = Field(..., description="업데이트할 커리큘럼 ID")
    grade: str = Field(..., description="학년")
    subject: str = Field(..., description="과목")
    assessment_results: Dict[str, Any] = Field(..., description="평가 결과 데이터")


class CurriculumUpdateResponse(BaseModel):
    """커리큘럼 업데이트 응답"""
    
    curriculum_id: str = Field(..., description="커리큘럼 ID")
    changes_summary: str = Field(..., description="변경 사항 요약")


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
