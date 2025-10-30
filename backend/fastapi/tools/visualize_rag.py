from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from rich.console import Console
from rich.table import Table
from rich.tree import Tree

load_dotenv(dotenv_path=Path(".env.local"))
load_dotenv()

from rag_pipeline.api.schemas import (
    ProblemGenerationRequest,
    ProblemGenerationResponse,
)
from rag_pipeline.roadmap.models import Roadmap, RoadmapNode, RoadmapResource
from rag_pipeline.services.problem_service import ProblemGenerationService

console = Console()


def _render_roadmap(roadmap: Optional[Roadmap]) -> None:
    if not roadmap or not roadmap.root_id:
        console.print("[yellow]로드맵 데이터가 없습니다.[/]")
        return

    root = roadmap.get_node(roadmap.root_id)
    tree = Tree(_format_node_label(root), guide_style="bold bright_blue")

    def _add_children(branch: Tree, node: RoadmapNode) -> None:
        for child in roadmap.get_children(node.node_id):
            child_branch = branch.add(_format_node_label(child))
            for resource in child.resources:
                child_branch.add(_format_resource_label(resource))
            _add_children(child_branch, child)

    _add_children(tree, root)
    console.print(tree)


def _format_node_label(node: RoadmapNode) -> str:
    meta_bits = []
    if node.difficulty:
        meta_bits.append(f"난이도: {node.difficulty}")
    if node.achievement_codes:
        meta_bits.append(f"성취: {', '.join(node.achievement_codes)}")
    meta_text = f" ({'; '.join(meta_bits)})" if meta_bits else ""
    summary = f"\n[dim]{node.summary}[/]" if node.summary else ""
    return f"[bold]{node.title}[/] - {node.objective}{meta_text}{summary}"


def _format_resource_label(resource: RoadmapResource) -> str:
    return f"[green]{resource.type}[/] {resource.label} [dim](source: {resource.source_id})[/]"


def _render_problem_set(response: ProblemGenerationResponse) -> None:
    table = Table(title="객관식 문제 세트", show_lines=True)
    table.add_column("#", justify="center", style="cyan")
    table.add_column("문항", style="bold")
    table.add_column("선지", style="white")
    table.add_column("정답", justify="center", style="green")
    table.add_column("해설", style="magenta")

    for idx, question in enumerate(response.questions, start=1):
        options = "\n".join(f"{opt.label}. {opt.text}" for opt in question.options)
        table.add_row(str(idx), question.question, options, question.answer, question.explanation)

    console.print(table)
    console.print(f"[bold]메타데이터:[/] {response.metadata.model_dump()}")


def _load_json(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def run_problem_generation(args: argparse.Namespace) -> None:
    if args.from_json:
        data = _load_json(args.from_json)
        response = ProblemGenerationResponse.model_validate(data)
    else:
        request = ProblemGenerationRequest(
            query=args.query,
            grade=args.grade,
            subject=args.subject,
            sub_subject=args.sub_subject,
            num_questions=args.num_questions,
            num_choices=args.num_choices,
            retrieval_limit=args.retrieval_limit,
        )
        service = ProblemGenerationService()
        response = service.generate(request)

    console.rule("[bold green]문제 생성 결과")
    _render_problem_set(response)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="RAG 결과를 시각적으로 확인하는 CLI 도구")
    subparsers = parser.add_subparsers(dest="command", required=True)

    prob_parser = subparsers.add_parser("problems", help="문제 생성 결과 렌더링")
    prob_parser.add_argument("--query", help="검색/생성 주제", required=False)
    prob_parser.add_argument("--grade", help="학년")
    prob_parser.add_argument("--subject", help="과목")
    prob_parser.add_argument("--sub-subject", help="세부 과목", dest="sub_subject")
    prob_parser.add_argument("--num-questions", type=int, default=3)
    prob_parser.add_argument("--num-choices", type=int, default=5)
    prob_parser.add_argument("--retrieval-limit", type=int, default=5)
    prob_parser.add_argument("--from-json", help="ProblemGenerationResponse JSON 파일 경로")

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "problems":
        if not args.from_json and not args.query:
            parser.error("problems 모드는 --query 또는 --from-json 중 하나를 지정해야 합니다.")
        run_problem_generation(args)
    else:  # pragma: no cover
        parser.error(f"지원하지 않는 명령입니다: {args.command}")


if __name__ == "__main__":
    main()
