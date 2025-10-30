from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List

from rag_pipeline.api.schemas import FeedbackRequest, FeedbackResponse
from rag_pipeline.prompting.loader import PromptLoader
from rag_pipeline.services.openai_client import get_openai_client

logger = logging.getLogger(__name__)


class FeedbackService:
    """AI 기반 학습 피드백 생성 서비스"""

    def __init__(self) -> None:
        self.openai_client = get_openai_client()
        self.prompt_loader = PromptLoader()

    async def generate_feedback(
        self, request: FeedbackRequest
    ) -> FeedbackResponse:
        """
        평가 결과를 분석하여 AI 기반 학습 피드백을 생성합니다.
        
        Args:
            request: 피드백 생성 요청
            
        Returns:
            생성된 피드백 정보
        """
        logger.info(f"Generating feedback for assessment results with {len(request.assessment_results)} problems")
        
        try:
            # 1. 평가 결과 통계 분석
            stats = self._analyze_statistics(request.assessment_results)
            
            # 2. 프롬프트 로드
            prompt_template = self.prompt_loader.load("feedback_generation")
            
            # 3. 사용자 프롬프트 구성
            user_prompt = self._build_user_prompt(stats, request.curriculum_context)
            
            # 4. OpenAI 호출
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": prompt_template["system"]},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.7,
                max_tokens=1500,
            )
            
            # 5. 응답 파싱
            content = response.choices[0].message.content
            feedback_data = json.loads(content)
            
            logger.info(
                f"Successfully generated feedback: "
                f"accuracy={stats['accuracy']:.1%}, "
                f"strengths={len(feedback_data.get('strengths', []))}, "
                f"weaknesses={len(feedback_data.get('weaknesses', []))}"
            )
            
            return FeedbackResponse(
                feedback_summary=feedback_data["feedback_summary"],
                strengths=feedback_data["strengths"],
                weaknesses=feedback_data["weaknesses"],
                recommendations=feedback_data["recommendations"],
            )
        
        except json.JSONDecodeError as exc:
            logger.exception("Failed to parse OpenAI response")
            # Fallback: 기본 피드백 생성
            return self._generate_fallback_feedback(stats)
        
        except Exception as exc:
            logger.exception("Failed to generate feedback")
            # Fallback: 기본 피드백 생성
            stats = self._analyze_statistics(request.assessment_results)
            return self._generate_fallback_feedback(stats)

    def _analyze_statistics(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        평가 결과 통계를 분석합니다.
        
        Args:
            results: 평가 결과 데이터
            
        Returns:
            통계 분석 결과
        """
        total = len(results)
        correct = sum(1 for r in results.values() if r.get("correct"))
        
        # 주제별 통계
        topic_stats = {}
        for result in results.values():
            topic = result.get("topic", "기타")
            if topic not in topic_stats:
                topic_stats[topic] = {
                    "correct": 0,
                    "total": 0,
                    "time": [],
                    "difficulty": []
                }
            
            topic_stats[topic]["total"] += 1
            if result.get("correct"):
                topic_stats[topic]["correct"] += 1
            topic_stats[topic]["time"].append(result.get("time_spent", 0))
            topic_stats[topic]["difficulty"].append(result.get("difficulty", "medium"))
        
        return {
            "accuracy": correct / total if total > 0 else 0,
            "total_questions": total,
            "correct_count": correct,
            "topic_stats": topic_stats,
        }

    def _build_user_prompt(self, stats: Dict[str, Any], context: Dict[str, Any]) -> str:
        """
        사용자 프롬프트를 구성합니다.
        
        Args:
            stats: 통계 분석 결과
            context: 커리큘럼 컨텍스트
            
        Returns:
            구성된 프롬프트 텍스트
        """
        topic_lines = []
        for topic, data in stats["topic_stats"].items():
            accuracy = data["correct"] / data["total"] if data["total"] > 0 else 0
            avg_time = sum(data["time"]) / len(data["time"]) if data["time"] else 0
            topic_lines.append(
                f"  - {topic}: 정답률 {accuracy:.1%} ({data['correct']}/{data['total']}), "
                f"평균 소요 시간 {avg_time:.1f}초"
            )
        
        topic_analysis = "\n".join(topic_lines) if topic_lines else "  - 분석 불가"
        
        context_info = ""
        if context:
            grade = context.get("grade", "")
            subject = context.get("subject", "")
            recent_topics = context.get("recent_topics", [])
            
            if grade:
                context_info += f"- 학년: {grade}\n"
            if subject:
                context_info += f"- 과목: {subject}\n"
            if recent_topics:
                context_info += f"- 최근 학습 주제: {', '.join(recent_topics)}\n"
        
        return f"""
평가 결과 분석:
- 전체 정답률: {stats['accuracy']:.1%}
- 맞힌 문제: {stats['correct_count']}/{stats['total_questions']}

주제별 성취도:
{topic_analysis}

학생 정보:
{context_info if context_info else "- 정보 없음"}

위 결과를 바탕으로 다음을 JSON 형식으로 생성하세요:
{{
  "feedback_summary": "1-2문장으로 전체 평가 결과를 요약합니다",
  "strengths": ["잘한 점 1", "잘한 점 2", "잘한 점 3"],
  "weaknesses": ["개선 필요한 점 1", "개선 필요한 점 2", "개선 필요한 점 3"],
  "recommendations": ["구체적인 학습 조언 1", "구체적인 학습 조언 2", "구체적인 학습 조언 3"]
}}

주의사항:
- 긍정적이고 격려하는 톤을 유지하세요
- 구체적이고 실행 가능한 조언을 제공하세요
- 학생의 수준에 맞는 표현을 사용하세요
- 각 항목은 최소 3개 이상 작성하세요
"""

    def _generate_fallback_feedback(self, stats: Dict[str, Any]) -> FeedbackResponse:
        """
        OpenAI API 실패 시 기본 피드백을 생성합니다.
        
        Args:
            stats: 통계 분석 결과
            
        Returns:
            기본 피드백 응답
        """
        accuracy = stats["accuracy"]
        
        # 피드백 요약
        if accuracy >= 0.8:
            summary = f"우수한 성취도를 보였습니다 (정답률 {accuracy:.1%}). 계속 학습을 이어가세요."
        elif accuracy >= 0.6:
            summary = f"양호한 성취도를 보였습니다 (정답률 {accuracy:.1%}). 조금 더 노력하면 더 좋은 결과를 얻을 수 있습니다."
        else:
            summary = f"추가 학습이 필요합니다 (정답률 {accuracy:.1%}). 기초를 다시 다지는 것을 추천합니다."
        
        # 강점
        strengths = []
        for topic, data in stats["topic_stats"].items():
            topic_accuracy = data["correct"] / data["total"] if data["total"] > 0 else 0
            if topic_accuracy >= 0.7:
                strengths.append(f"{topic} 영역에서 좋은 성과를 보였습니다")
        
        if not strengths:
            strengths = ["문제를 끝까지 풀어보려는 노력을 보였습니다"]
        
        # 약점
        weaknesses = []
        for topic, data in stats["topic_stats"].items():
            topic_accuracy = data["correct"] / data["total"] if data["total"] > 0 else 0
            if topic_accuracy < 0.5:
                weaknesses.append(f"{topic} 영역에서 어려움을 겪었습니다 ({data['correct']}/{data['total']} 정답)")
        
        if not weaknesses:
            weaknesses = ["시간 관리를 조금 더 신경 쓸 필요가 있습니다"]
        
        # 추천 사항
        recommendations = []
        for topic, data in stats["topic_stats"].items():
            topic_accuracy = data["correct"] / data["total"] if data["total"] > 0 else 0
            if topic_accuracy < 0.5:
                recommendations.append(f"{topic} 기초 개념을 복습하고 연습 문제를 풀어보세요")
        
        if not recommendations:
            recommendations = [
                "틀린 문제를 다시 풀어보며 왜 틀렸는지 분석해보세요",
                "매일 꾸준히 학습하는 습관을 들이세요",
                "어려운 부분은 선생님이나 친구에게 질문하세요"
            ]
        
        return FeedbackResponse(
            feedback_summary=summary,
            strengths=strengths[:5],  # 최대 5개
            weaknesses=weaknesses[:5],
            recommendations=recommendations[:5],
        )


def get_feedback_service() -> FeedbackService:
    """피드백 서비스 인스턴스를 반환합니다."""
    return FeedbackService()
