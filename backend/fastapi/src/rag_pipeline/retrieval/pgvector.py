from __future__ import annotations

from typing import Dict, List, Optional

import psycopg
from psycopg.rows import dict_row

from rag_pipeline.config import settings
from rag_pipeline.embeddings.local_embeddings import LocalEmbeddingClient

# pgvector 테이블에서 질의 벡터와 가장 가까운 학습 자료를 검색


def _resolve_dsn() -> str:
    dsn = settings.database_url
    if "+psycopg_async" in dsn:
        dsn = dsn.replace("+psycopg_async", "")
    return dsn


def _build_where_clause(filters: Dict[str, Optional[str]]) -> str:
    clauses = []
    for key, value in filters.items():
        if value:
            clauses.append(f"{key} = %({key})s")
    if not clauses:
        return ""
    return "WHERE " + " AND ".join(clauses)


def retrieve_passages(
    query: str,
    *,
    grade: Optional[str] = None,
    subject: Optional[str] = None,
    sub_subject: Optional[str] = None,
    limit: int = 5,
) -> List[Dict[str, str]]:
    """Return top-N passages from curriculum_embeddings."""
    filters = {"grade": grade, "subject": subject, "sub_subject": sub_subject}
    where_sql = _build_where_clause(filters)

    with LocalEmbeddingClient() as client:
        # 요청 쿼리를 fastembed로 벡터화해 pgvector 유사도 검색에 사용
        embedding = client.embed([query])[0]

    vector_literal = "[" + ",".join(str(x) for x in embedding) + "]"
    sql_query = f"""
        SELECT source_name,
               grade,
               subject,
               sub_subject,
               text,
               achievement_codes,
               difficulty,
               embedding <-> '{vector_literal}'::vector AS distance
        FROM curriculum_embeddings
        {where_sql}
        ORDER BY embedding <-> '{vector_literal}'::vector
        LIMIT {limit}
    """
    # pgvector의 L2 거리(<->)를 사용해 최상위 문서를 가져온다

    dsn = _resolve_dsn()
    rows: List[Dict[str, str]] = []
    with psycopg.connect(dsn) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            # 필터 파라미터를 그대로 바인딩해 안전하게 실행
            cur.execute(sql_query, filters)
            for row in cur.fetchall():
                rows.append(dict(row))
    return rows
