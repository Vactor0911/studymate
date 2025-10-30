from __future__ import annotations

import logging
from contextlib import AbstractContextManager
from typing import Iterable, List, Sequence

from huggingface_hub import InferenceClient
from huggingface_hub.utils import HfHubHTTPError

from rag_pipeline.config import settings

logger = logging.getLogger(__name__)


class LocalEmbeddingClient(AbstractContextManager["LocalEmbeddingClient"]):
    """Hugging Face Inference API 기반 텍스트 임베딩 클라이언트."""

    def __init__(
        self,
        model_name: str | None = None,
        *,
        timeout: float = 30.0,
    ) -> None:
        self.model_name = model_name or settings.embedding_model
        self.timeout = timeout
        self._client: InferenceClient | None = None
        self._token = settings.huggingface_token

    def __enter__(self) -> "LocalEmbeddingClient":
        if self._client is None:
            self._client = self._build_client()
        return self

    def __exit__(self, exc_type, exc, exc_tb) -> bool:
        return False

    def embed(self, texts: Sequence[str] | Iterable[str]) -> List[List[float]]:
        texts_list = list(texts)
        if not texts_list:
            logger.warning("Called embed with empty input sequence.")
            return []

        client = self._client or self._build_client()
        embeddings: List[List[float]] = []
        for text in texts_list:
            try:
                raw = client.feature_extraction(text, timeout=self.timeout)
            except HfHubHTTPError as exc:
                logger.exception("Failed to fetch embeddings from Hugging Face (model=%s)", self.model_name)
                raise RuntimeError("Hugging Face embedding request failed") from exc

            pooled = self._pool_embedding(raw)
            if not pooled:
                logger.warning("Received empty embedding vector from Hugging Face model '%s'", self.model_name)
            embeddings.append(pooled)

        return embeddings

    def _build_client(self) -> InferenceClient:
        if not self._token:
            raise RuntimeError(
                "HUGGINGFACE_TOKEN is not configured but Hugging Face embeddings were requested."
            )

        logger.info("Using Hugging Face Inference API model '%s' for embeddings", self.model_name)
        return InferenceClient(model=self.model_name, token=self._token)

    @staticmethod
    def _pool_embedding(raw_embedding: object) -> List[float]:
        """
        Hugging Face feature-extraction 응답을 1차원 벡터로 변환한다.

        sentence-transformers 계열 모델은 토큰별 벡터(2차원 리스트)를 반환하므로
        평균 풀링으로 단일 문장 임베딩을 만든다.
        """
        if raw_embedding is None:
            return []

        if isinstance(raw_embedding, list):
            if not raw_embedding:
                return []

            first = raw_embedding[0]
            if isinstance(first, list):
                # 평균 풀링
                length = len(first)
                accumulator = [0.0] * length
                for token_vector in raw_embedding:
                    for idx, value in enumerate(token_vector):
                        accumulator[idx] += float(value)
                token_count = len(raw_embedding)
                if token_count == 0:
                    return []
                return [value / token_count for value in accumulator]

            # 이미 1차원 벡터라면 그대로 반환
            return [float(x) for x in raw_embedding]

        # numpy.ndarray 등 다른 형식은 리스트로 변환 시도
        try:
            import numpy as np  # type: ignore

            if isinstance(raw_embedding, np.ndarray):
                if raw_embedding.ndim == 1:
                    return raw_embedding.astype(float).tolist()
                if raw_embedding.ndim == 2 and raw_embedding.shape[0] > 0:
                    return raw_embedding.mean(axis=0).astype(float).tolist()
        except Exception:  # pragma: no cover - numpy optional
            pass

        logger.warning("Unsupported embedding response type: %r", type(raw_embedding))
        return []
