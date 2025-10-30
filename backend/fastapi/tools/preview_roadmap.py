from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv

from rag_pipeline.roadmap.builder import build_roadmap_from_contexts
from rag_pipeline.roadmap.models import Roadmap, RoadmapNode, RoadmapResource

# 진단용 로드맵을 검색·시각화하는 CLI 도구


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="진단 로드맵 구성을 미리 확인하는 도구",
    )
    parser.add_argument("--grade", required=True, help="예: 초등학교 4학년")
    parser.add_argument("--subject", required=True, help="예: 국어, 수학")
    parser.add_argument("--sub-subject", help="선택 세부 과목 필터")
    parser.add_argument(
        "--query",
        help="검색 시 사용할 키워드 (지정하지 않으면 과목/학년/세부과목을 조합)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=6,
        help="로드맵 생성을 위한 검색 결과 수",
    )
    parser.add_argument(
        "--contexts-json",
        type=Path,
        help="DB 검색 대신 사용할 컨텍스트 JSON(List[dict] 또는 {'contexts': [...]})",
    )
    parser.add_argument(
        "--export-json",
        type=Path,
        help="로드맵 트리를 JSON 파일로 저장",
    )
    parser.add_argument(
        "--export-mermaid",
        type=Path,
        help="Mermaid 다이어그램(.md)에 로드맵 트리를 저장",
    )
    return parser.parse_args()


def load_contexts(args: argparse.Namespace) -> List[Dict[str, Any]]:
    if args.contexts_json:
        content = args.contexts_json.read_text(encoding="utf-8-sig")
        data = json.loads(content)
        if isinstance(data, dict) and "contexts" in data:
            contexts = data["contexts"]
        elif isinstance(data, list):
            contexts = data
        else:
            raise ValueError("contexts JSON은 리스트이거나 {'contexts': [...]} 형태여야 합니다.")
        return list(contexts)

    query_parts = [
        args.query,
        args.subject,
        args.grade,
        args.sub_subject,
    ]
    query = " ".join(part for part in query_parts if part).strip()
    if not query:
        raise ValueError("검색용 query를 결정할 수 없습니다. 인자를 확인하세요.")

    from rag_pipeline.retrieval.pgvector import retrieve_passages

    return retrieve_passages(
        query,
        grade=args.grade,
        subject=args.subject,
        sub_subject=args.sub_subject,
        limit=args.limit,
    )


def print_roadmap(roadmap: Roadmap) -> None:
    if not roadmap.root_id:
        print("⚠️  로드맵에 노드가 없습니다.")
        return

    def _print_node(node: RoadmapNode, depth: int = 0) -> None:
        indent = "  " * depth
        print(f"{indent}- {node.title}")
        if node.objective:
            print(f"{indent}  · 목표: {node.objective}")
        if node.achievement_codes:
            joined = ", ".join(node.achievement_codes)
            print(f"{indent}  · 성취기준: {joined}")
        if node.summary:
            print(f"{indent}  · 요약: {node.summary}")
        if node.resources:
            print(f"{indent}  · 리소스:")
            for resource in node.resources:
                print_resource(resource, indent + "    ")
        for child in roadmap.get_children(node.node_id):
            _print_node(child, depth + 1)

    def print_resource(resource: RoadmapResource, indent: str) -> None:
        print(f"{indent}- {resource.label} ({resource.type})")
        meta = [
            f"{key}={value}"
            for key, value in resource.metadata.items()
            if value not in (None, "", [])
        ]
        if meta:
            print(f"{indent}  · {'; '.join(meta)}")

    root = roadmap.get_node(roadmap.root_id)
    _print_node(root)


def export_mermaid(roadmap: Roadmap, path: Path) -> None:
    if not roadmap.root_id:
        path.write_text("graph TD\n", encoding="utf-8")
        return

    lines = ["graph TD"]
    visited: set[str] = set()
    node_defs: List[str] = []
    id_map: Dict[str, str] = {}

    def _map_id(node: RoadmapNode) -> str:
        if node.node_id not in id_map:
            mapped = f"n{len(id_map)}"
            id_map[node.node_id] = mapped
            label_title = node.title.replace('"', "'")
            label = label_title
            node_defs.append(f'    {mapped}["{label}"]')
        return id_map[node.node_id]

    def _walk(node: RoadmapNode) -> None:
        for child in roadmap.get_children(node.node_id):
            parent_id = _map_id(node)
            child_id = _map_id(child)
            lines.append(f"    {parent_id} --> {child_id}")
            if child.node_id not in visited:
                visited.add(child.node_id)
                _walk(child)

    root = roadmap.get_node(roadmap.root_id)
    visited.add(root.node_id)
    _map_id(root)
    _walk(root)
    output = "\n".join(["graph TD"] + node_defs + lines[1:]) + "\n"
    path.write_text(output, encoding="utf-8")


def _sanitize_id(value: str | None) -> str | None:
    if not value:
        return value
    parts = value.split("-")
    if len(parts) <= 1:
        return value
    return "-".join(parts[:-1])


def sanitize_tree(tree: Dict[str, Any]) -> Dict[str, Any]:
    def _walk(node_entry: Dict[str, Any]) -> Dict[str, Any]:
        node = node_entry["node"]
        node["node_id"] = _sanitize_id(node.get("node_id"))
        if node.get("parent_id"):
            node["parent_id"] = _sanitize_id(node["parent_id"])
        if node.get("child_ids"):
            node["child_ids"] = [_sanitize_id(cid) for cid in node["child_ids"]]
        node_entry["children"] = [_walk(child) for child in node_entry.get("children", [])]
        return node_entry

    return _walk(tree)


def main() -> None:
    load_dotenv(Path(".env.local"))
    load_dotenv()

    args = parse_args()

    try:
        contexts = load_contexts(args)
    except Exception as exc:  # pragma: no cover - CLI feedback
        print(f"컨텍스트 로딩 실패: {exc}", file=sys.stderr)
        sys.exit(1)

    if not contexts:
        print("⚠️  검색 결과가 없어 로드맵을 만들 수 없습니다.")
        sys.exit(2)

    roadmap = build_roadmap_from_contexts(
        grade=args.grade,
        subject=args.subject,
        contexts=contexts,
    )

    print("=== 로드맵 개요 ===")
    print_roadmap(roadmap)

    if args.export_json:
        data = roadmap.as_tree()
        if data:
            data = sanitize_tree(data)
        args.export_json.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\n로드맵 트리를 {args.export_json} 파일에 저장했습니다.")
    if args.export_mermaid:
        export_mermaid(roadmap, args.export_mermaid)
        print(f"Mermaid 다이어그램을 {args.export_mermaid} 파일에 저장했습니다.")


if __name__ == "__main__":
    main()
