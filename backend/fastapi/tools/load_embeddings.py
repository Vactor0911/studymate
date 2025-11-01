from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, Iterable, Iterator, List

import psycopg
from psycopg import sql

from rag_pipeline.config import settings


def _resolve_dsn() -> str:
    dsn = settings.database_url
    if "+psycopg_async" in dsn:
        dsn = dsn.replace("+psycopg_async", "")
    return dsn


def discover_dimension(jsonl_path: Path) -> int:
    with jsonl_path.open("r", encoding="utf-8") as infile:
        for line in infile:
            line = line.strip()
            if not line:
                continue
            payload = json.loads(line)
            embedding = payload.get("embedding")
            if isinstance(embedding, list):
                return len(embedding)
    raise RuntimeError("임베딩 차원을 찾을 수 없습니다.")


def stream_rows(jsonl_path: Path) -> Iterator[Dict[str, object]]:
    with jsonl_path.open("r", encoding="utf-8") as infile:
        for line_no, line in enumerate(infile, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                payload = json.loads(line)
            except json.JSONDecodeError as exc:
                raise RuntimeError(f"JSON 파싱 오류 (line {line_no}): {exc}") from exc

            yield {
                "id": payload.get("source_name") or f"row-{line_no}",
                "source_path": payload.get("source_path"),
                "source_name": payload.get("source_name"),
                "grade": payload.get("grade"),
                "subject": payload.get("subject"),
                "sub_subject": payload.get("sub_subject"),
                "difficulty": payload.get("difficulty"),
                "achievement_codes": payload.get("achievement_codes", []),
                "text": payload.get("text"),
                "embedding": payload.get("embedding"),
            }


def chunked(iterable: Iterable[Dict[str, object]], size: int) -> Iterator[List[Dict[str, object]]]:
    chunk: List[Dict[str, object]] = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def load_embeddings(
    jsonl_path: Path,
    *,
    table_name: str,
    batch_size: int,
) -> None:
    dsn = _resolve_dsn()
    dimension = discover_dimension(jsonl_path)

    create_table_sql = sql.SQL(
        """
        CREATE TABLE IF NOT EXISTS {table} (
            id TEXT PRIMARY KEY,
            source_path TEXT NOT NULL,
            source_name TEXT NOT NULL,
            grade TEXT,
            subject TEXT,
            sub_subject TEXT,
            difficulty TEXT,
            achievement_codes TEXT[],
            text TEXT NOT NULL,
            embedding VECTOR({dimension})
        )
        """
    ).format(table=sql.Identifier(table_name), dimension=sql.Literal(dimension))

    truncate_sql = sql.SQL("TRUNCATE TABLE {table}").format(table=sql.Identifier(table_name))

    insert_sql = sql.SQL(
        """
        INSERT INTO {table} (
            id, source_path, source_name,
            grade, subject, sub_subject,
            difficulty, achievement_codes,
            text, embedding
        )
        VALUES (
            %(id)s, %(source_path)s, %(source_name)s,
            %(grade)s, %(subject)s, %(sub_subject)s,
            %(difficulty)s, %(achievement_codes)s,
            %(text)s, %(embedding)s::vector
        )
        """
    ).format(table=sql.Identifier(table_name))

    with psycopg.connect(dsn) as conn:
        conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
        conn.execute(create_table_sql)
        conn.execute(truncate_sql)
        conn.commit()

        with conn.cursor() as cur:
            for batch in chunked(stream_rows(jsonl_path), batch_size):
                for row in batch:
                    embedding = row.pop("embedding")
                    if not isinstance(embedding, list):
                        raise RuntimeError(f"잘못된 임베딩 형식: {embedding!r}")
                    row["embedding"] = "[" + ",".join(str(x) for x in embedding) + "]"
                    cur.execute(insert_sql, row)
            conn.commit()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="embedding_cache.jsonl을 pgvector 테이블에 적재합니다.")
    parser.add_argument("--jsonl", type=Path, default=Path("artifacts/embedding_cache.jsonl"))
    parser.add_argument("--table", default="curriculum_embeddings")
    parser.add_argument("--batch-size", type=int, default=200)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    load_embeddings(args.jsonl, table_name=args.table, batch_size=args.batch_size)
    print(f"Loaded embeddings into '{args.table}'.")


if __name__ == "__main__":
    main()
