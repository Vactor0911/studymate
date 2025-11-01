from __future__ import annotations

import uuid
from collections import defaultdict
from typing import Any, Dict, List, Sequence

from rag_pipeline.utils.text import slugify, summarize_text

from .models import Roadmap, RoadmapNode, RoadmapResource


def build_roadmap_from_contexts(
    *,
    grade: str,
    subject: str,
    contexts: Sequence[Dict[str, Any]],
) -> Roadmap:
    """검색된 콘텍스트 목록을 바탕으로 계층형 로드맵을 생성한다."""
    roadmap = Roadmap()

    # Grade node (root)
    grade_title = grade or "학습 로드맵"
    grade_id = f"{slugify(grade_title)}-{uuid.uuid4().hex[:6]}"
    grade_node = RoadmapNode(
        node_id=grade_id,
        title=grade_title,
        objective=f"{grade_title} 수준의 학습 흐름을 정리합니다.",
        summary=None,
        achievement_codes=[],
    )
    roadmap.add_node(grade_node, as_root=True)

    # Subject node under grade
    subject_title = subject or "교과"
    subject_id = f"{slugify(subject_title)}-{uuid.uuid4().hex[:6]}"
    subject_node = RoadmapNode(
        node_id=subject_id,
        title=subject_title,
        objective=f"{subject_title} 교과 핵심 영역을 재구성합니다.",
        summary=None,
        achievement_codes=[],
    )
    roadmap.add_node(subject_node)
    roadmap.link(grade_node.node_id, subject_node.node_id)

    groups = _group_by_sub_subject(contexts)

    for sub_subject, items in groups.items():
        node_id = f"{slugify(sub_subject)}-{uuid.uuid4().hex[:6]}"
        achievement_codes = sorted({code for item in items for code in item.get("achievement_codes") or []})
        child_node = RoadmapNode(
            node_id=node_id,
            title=sub_subject,
            objective=_build_objective(sub_subject),
            summary=summarize_text(items[0].get("text", "")),
            difficulty=_pick_difficulty(items),
            achievement_codes=achievement_codes,
        )
        roadmap.add_node(child_node)
        roadmap.link(subject_node.node_id, child_node.node_id)

        for item in items[:5]:
            resource = RoadmapResource(
                type="passage",
                label=item.get("source_name") or "자료",
                source_id=item.get("source_name") or item.get("source_path") or child_node.node_id,
                metadata={
                    "grade": item.get("grade"),
                    "subject": item.get("subject"),
                    "sub_subject": item.get("sub_subject"),
                    "difficulty": item.get("difficulty"),
                    "achievement_codes": item.get("achievement_codes") or [],
                },
            )
            child_node.attach_resource(resource)

    return roadmap


def _group_by_sub_subject(contexts: Sequence[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for item in contexts:
        sub_subject = item.get("sub_subject") or "기초 개념 다지기"
        grouped[sub_subject].append(item)
    return grouped


def _pick_difficulty(items: Sequence[Dict[str, Any]]) -> str | None:
    for item in items:
        difficulty = item.get("difficulty")
        if difficulty:
            return str(difficulty)
    return None


def _build_objective(sub_subject: str) -> str:
    return f"{sub_subject} 핵심 개념을 이해하고 대표 문제를 해결합니다."
