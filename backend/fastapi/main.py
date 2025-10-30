from __future__ import annotations

import json
import logging
import os
import re
import sys
from pathlib import Path
from typing import Iterable, List, Sequence

SRC_PATH = Path(__file__).resolve().parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from rag_pipeline.api.routes import router as rag_router
from rag_pipeline.config import settings

logger = logging.getLogger(__name__)

DEFAULT_LOCAL_ORIGINS: tuple[str, ...] = ("http://localhost:8080",)
PRODUCTION_ORIGIN: str = "https://hanataba227.github.io"


def create_app(*, allowed_origins: Iterable[str] | None = None) -> FastAPI:
    """FastAPI 애플리케이션 인스턴스를 생성한다."""
    app = FastAPI(title="Project S RAG API", version="0.1.0")

    origins = _resolve_allowed_origins(allowed_origins)
    _configure_cors(app, origins)
    _register_routes(app)
    _register_healthcheck(app)

    logger.debug("FastAPI application initialized (environment=%s)", settings.environment)
    return app


def _resolve_allowed_origins(allowed_origins: Iterable[str] | None) -> List[str]:
    """
    허용할 CORS 오리진 목록을 결정한다.
    우선순위: 인자로 전달된 값 > 환경 변수 > production/local 환경별 기본값.
    """
    if allowed_origins is not None:
        return _normalize_origins(allowed_origins)

    # 환경 변수에서 명시적으로 설정된 경우
    env_origins = _normalize_origins(_read_env_origins())
    if env_origins:
        return env_origins

    # 환경별 기본값 설정
    environment = str(settings.environment).lower()
    
    if environment == "production":
        logger.info(
            "Production environment detected; using production origin: %s",
            PRODUCTION_ORIGIN,
        )
        return [PRODUCTION_ORIGIN]
    else:
        logger.info(
            "Local/development environment detected; using local origin: %s",
            DEFAULT_LOCAL_ORIGINS,
        )
        return list(DEFAULT_LOCAL_ORIGINS)


def _read_env_origins() -> Sequence[str]:
    raw = os.getenv("CORS_ALLOW_ORIGINS", "")
    if not raw:
        return []
    return re.split(r"[,\s;]+", raw)


def _normalize_origins(origins: Iterable[str]) -> List[str]:
    cleaned: List[str] = []
    for origin in origins:
        value = origin.strip()
        if not value:
            continue
        if value == "*":
            logger.warning("Wildcard '*' origin ignored because credentials are required.")
            continue
        if value not in cleaned:
            cleaned.append(value)
    return cleaned


def _configure_cors(app: FastAPI, origins: Sequence[str]) -> None:
    if not origins:
        logger.debug("Skipping CORS middleware because no origins were provided.")
        return

    logger.info("Configuring CORS with allowed origins: %s", origins)
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(origins),
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type", "Authorization"],
    )


def _register_routes(app: FastAPI) -> None:
    app.include_router(rag_router)


def _register_healthcheck(app: FastAPI) -> None:
    @app.get("/health", tags=["health"])
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok"}


app = create_app()
