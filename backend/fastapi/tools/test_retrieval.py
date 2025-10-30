from __future__ import annotations

import argparse
from typing import List, Tuple

import psycopg

from rag_pipeline.config import settings
from rag_pipeline.embeddings.local_embeddings import LocalEmbeddingClient


def _resolve_dsn() -> str:
    dsn = settings.database_url
    if "+psycopg_async" in dsn:
        dsn = dsn.replace("+psycopg_async", "")
    return dsn


def embed_query(text: str) -> List[float]:
    with LocalEmbeddingClient() as client:
        vectors = client.embed([text])
    return vectors[0]


def run_retrieval(
    conn: psycopg.Connection,
    table: str,
    query: str,
    *,
    subject: str | None,
    grade: str | None,
    limit: int,
) -> List[Tuple]:
    embedding = embed_query(query)
    vector_literal = "[" + ",".join(str(x) for x in embedding) + "]"

    where_clauses: List[str] = []
    params: List[str] = []
    if subject:
        where_clauses.append("subject = %s")
        params.append(subject)
    if grade:
        where_clauses.append("grade = %s")
        params.append(grade)
    where_sql = " AND ".join(where_clauses)
    if where_sql:
        where_sql = "WHERE " + where_sql

    sql_query = f"""
        SELECT source_name, grade, subject, sub_subject,
               LEFT(text, 120) AS snippet,
               embedding <-> '{vector_literal}'::vector AS distance
        FROM {table}
        {where_sql}
        ORDER BY embedding <-> '{vector_literal}'::vector
        LIMIT {limit}
    """
    with conn.cursor() as cur:
        cur.execute(sql_query, params)
        return cur.fetchall()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="간단한 벡터 검색 스모크 테스트")
    parser.add_argument("--table", default="curriculum_embeddings")
    parser.add_argument("--subject", help="필터용 과목 (예: 국어)")
    parser.add_argument("--grade", help="필터용 학년 (예: 초등학교 3학년)")
    parser.add_argument("--query", required=True, help="검색 문장")
    parser.add_argument("--limit", type=int, default=5)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dsn = _resolve_dsn()

    with psycopg.connect(dsn) as conn:
        results = run_retrieval(
            conn,
            args.table,
            args.query,
            subject=args.subject,
            grade=args.grade,
            limit=args.limit,
        )

    print(f"Query: {args.query}")
    if not results:
        print("검색 결과가 없습니다.")
        if args.grade or args.subject:
            print("필터 없이 다시 시도하려면 --grade, --subject를 제거하고 실행하세요.")
        return

    for idx, row in enumerate(results, start=1):
        source_name, grade, subject, sub_subject, snippet, distance = row
        print(f"[{idx}] {source_name} | {grade} {subject} {sub_subject} | dist={distance:.4f}")
        print(f"    {snippet}")


if __name__ == "__main__":
    main()
