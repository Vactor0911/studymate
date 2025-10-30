from __future__ import annotations

import os
from pathlib import Path

from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            Path(__file__).resolve().parent.parent.parent / ".env.local",
            Path(__file__).resolve().parent.parent.parent / ".env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent)
    data_roots: List[Path] = Field(alias="DATA_ROOTS")
    artifacts_root: Path = Field(alias="ARTIFACTS_ROOT")
    embedding_model: str = Field(alias="EMBEDDING_MODEL")
    openai_api_key: str = Field(alias="OPENAI_API_KEY")
    openai_model: str = Field(alias="OPENAI_MODEL")
    database_url: str = Field(alias="DATABASE_URL")
    environment: str = Field(alias="ENVIRONMENT")
    huggingface_token: str | None = Field(default=None, alias="HUGGINGFACE_TOKEN")
    naver_client_id: str | None = Field(default=None, alias="NAVER_CLIENT_ID")
    naver_client_secret: str | None = Field(default=None, alias="NAVER_CLIENT_SECRET")
    naver_ocr_secret: str | None = Field(default=None, alias="NAVER_OCR_SECRET")
    naver_ocr_endpoint: str = Field(
        default="https://naveropenapi.apigw.ntruss.com/vision/v2/general",
        alias="NAVER_OCR_ENDPOINT",
    )
    ocr_provider: str = Field(default="naver", alias="OCR_PROVIDER")
    openai_vision_model: str | None = Field(default=None, alias="OPENAI_VISION_MODEL")

    @property
    def existing_data_roots(self) -> List[Path]:
        roots: List[Path] = []
        for root in self.data_roots:
            root_path = root if root.is_absolute() else self.project_root / root
            if root_path.exists():
                roots.append(root_path)
        return roots


settings = Settings()


def resolve_path(*parts: str | os.PathLike[str]) -> Path:
    """Resolve a path relative to the project root."""
    return settings.project_root.joinpath(*parts)
