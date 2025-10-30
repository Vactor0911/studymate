from __future__ import annotations

import json
import logging
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from rag_pipeline.api.schemas import ProblemGenerationRequest, ProblemGenerationResponse
from rag_pipeline.prompting.loader import load_prompt
from rag_pipeline.retrieval.pgvector import retrieve_passages
from rag_pipeline.utils.text import summarize_text

from .openai_client import OpenAIJSONClient

logger = logging.getLogger(__name__)


class ProblemGenerationService:
    def __init__(
        self,
        prompt_file: str = "problem_generation.yaml",
        *,
        retriever=retrieve_passages,
        client: Optional[OpenAIJSONClient] = None,
    ) -> None:
        self.prompt_template = load_prompt(prompt_file)
        self.retriever = retriever
        self.client = client or OpenAIJSONClient()

    def generate(self, params: ProblemGenerationRequest) -> ProblemGenerationResponse:
        contexts = self._retrieve_contexts(params)
        if not contexts:
            raise ValueError("관련 학습 자료를 찾을 수 없습니다. 다른 검색어를 시도해주세요.")

        user_prompt = self._build_user_prompt(params, contexts)
        raw_response = self.client.complete_json(self.prompt_template.content, user_prompt)
        validated = ProblemGenerationResponse.model_validate(raw_response)
        self._validate_response(validated, params)
        return validated

    def _retrieve_contexts(self, params: ProblemGenerationRequest) -> List[Dict[str, object]]:
        query = self._build_query(params)
        primary = self.retriever(
            query,
            grade=params.grade,
            subject=params.subject,
            sub_subject=params.sub_subject,
            limit=params.retrieval_limit,
        )
        if primary:
            return primary

        for grade_option, subject_option, sub_option in self._fallback_filters(params):
            candidates = self.retriever(
                query,
                grade=grade_option,
                subject=subject_option,
                sub_subject=sub_option,
                limit=params.retrieval_limit,
            )
            if candidates:
                logger.info(
                    "ProblemGenerationService fallback matched grade=%s subject=%s sub_subject=%s",
                    grade_option,
                    subject_option,
                    sub_option,
                )
                return candidates

        logger.warning(
            "ProblemGenerationService could not find retrieval matches for query='%s' grade=%s subject=%s sub_subject=%s",
            query,
            params.grade,
            params.subject,
            params.sub_subject,
        )
        return []

    @staticmethod
    def _build_query(params: ProblemGenerationRequest) -> str:
        parts = [
            params.query,
            params.grade or "",
            params.subject or "",
            params.sub_subject or "",
        ]
        return " ".join(part for part in parts if part).strip() or params.query

    def _fallback_filters(
        self, params: ProblemGenerationRequest
    ) -> Iterable[Tuple[Optional[str], Optional[str], Optional[str]]]:
        grade_candidates = self._candidate_grades(params.grade)
        subject_candidates = [params.subject, None] if params.subject else [None]
        sub_subject_candidates = [params.sub_subject, None] if params.sub_subject else [None]

        seen: set[Tuple[Optional[str], Optional[str], Optional[str]]] = set()
        for grade_option in grade_candidates:
            for subject_option in subject_candidates:
                for sub_option in sub_subject_candidates:
                    candidate = (grade_option, subject_option, sub_option)
                    if candidate == (params.grade, params.subject, params.sub_subject):
                        continue
                    if candidate in seen:
                        continue
                    seen.add(candidate)
                    yield candidate

        if (None, None, None) not in seen:
            yield (None, None, None)

    @staticmethod
    def _candidate_grades(grade: Optional[str]) -> List[Optional[str]]:
        if not grade:
            return [None]

        fallbacks = {
            "고등학교 3학년": ["고등학교 2학년", "고등학교 1학년"],
            "고등학교 2학년": ["고등학교 1학년"],
            "중학교 3학년": ["중학교 2학년", "중학교 1학년"],
            "초등학교 6학년": ["초등학교 5학년", "초등학교 4학년"],
        }
        candidates: List[Optional[str]] = [grade]
        for fallback in fallbacks.get(grade, []):
            if fallback not in candidates:
                candidates.append(fallback)
        if None not in candidates:
            candidates.append(None)
        return candidates

    def _build_user_prompt(
        self,
        params: ProblemGenerationRequest,
        contexts: Sequence[Dict[str, object]],
    ) -> str:
        # 참고 자료 포맷팅
        context_lines = []
        for idx, item in enumerate(contexts[: params.retrieval_limit], start=1):
            achievements = ", ".join(item.get("achievement_codes") or [])
            snippet = summarize_text(str(item.get("text", "")))
            context_lines.append(
                f"{idx}. 출처: {item.get('source_name')} "
                f"(세부: {item.get('sub_subject') or '미상'}, 난이도: {item.get('difficulty') or '미상'})\n"
                f"   성취기준: {achievements or '미등록'}\n"
                f"   요약: {snippet}"
            )

        # 메타데이터 준비
        source_ids = [str(item.get("source_name") or item.get("source_path")) for item in contexts]
        source_ids_json = json.dumps(source_ids, ensure_ascii=False)

        # User 프롬프트 (동적 데이터만 포함)
        prompt = f"""
[참고 자료]
{chr(10).join(context_lines)}

[요청 사항]
- 문제 수: {params.num_questions}개
- 보기 수: {params.num_choices}지선다
- 학년: {params.grade or '미지정'}
- 과목: {params.subject or '미지정'}
- 세부 과목: {params.sub_subject or '미지정'}

metadata의 source_ids는 다음과 같이 설정하세요: {source_ids_json}
"""
        return prompt.strip()

    @staticmethod
    def _validate_response(
        response: ProblemGenerationResponse,
        params: ProblemGenerationRequest,
    ) -> None:
        passage = getattr(response, "passage", "")
        if not isinstance(passage, str) or len(passage.strip()) < 80:
            raise ValueError("생성된 지문이 부족하거나 비어 있습니다.")

        if not response.questions:
            raise ValueError("생성된 문제 세트가 비어 있습니다.")

        expected_choices = params.num_choices
        expected_label_set = {str(i) for i in range(1, expected_choices + 1)}

        for idx, question in enumerate(response.questions, start=1):
            options = question.options
            if len(options) != expected_choices:
                raise ValueError(
                    f"{idx}번째 문항의 보기 수가 {expected_choices}개가 아닙니다 (현재 {len(options)}개)."
                )

            seen_labels: set[str] = set()
            for option in options:
                label_value = option.label
                label_str = str(label_value)
                if label_str not in expected_label_set:
                    raise ValueError(f"{idx}번째 문항에서 허용되지 않은 보기 라벨 '{label_value}'이 발견되었습니다.")
                if label_str in seen_labels:
                    raise ValueError(f"{idx}번째 문항에서 보기 라벨 '{label_value}'이 중복되었습니다.")
                if not option.text or not option.text.strip():
                    raise ValueError(f"{idx}번째 문항에서 보기 '{label_value}'의 내용이 비어 있습니다.")
                seen_labels.add(label_str)

            answer_label = str(question.answer)
            if answer_label not in seen_labels:
                raise ValueError(f"{idx}번째 문항에서 정답 라벨 '{question.answer}'이 보기 목록에 없습니다.")
            if not question.explanation or len(question.explanation.strip()) < 5:
                raise ValueError(f"{idx}번째 문항의 해설이 너무 짧거나 비어 있습니다.")


def get_problem_service() -> ProblemGenerationService:
    return ProblemGenerationService()
