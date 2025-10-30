from __future__ import annotations

import asyncio
import base64
import logging
import mimetypes
from pathlib import Path
from typing import Optional, Sequence

from rag_pipeline.api.schemas import OCRSolveRequest, OCRSolveResponse, OCRSolutionDetail
from rag_pipeline.config import settings
from rag_pipeline.prompting.loader import PromptLoader
from rag_pipeline.services.openai_client import OpenAIJSONClient, get_openai_client

logger = logging.getLogger(__name__)


class OpenAIVisionOCRClient:
    """OpenAI Vision 기반 단순 OCR 클라이언트."""

    def __init__(self, model: str | None = None) -> None:
        self.model = model or settings.openai_vision_model or settings.openai_model
        self._client = get_openai_client()

    async def extract_text(self, image_path: Path) -> str:
        if not image_path.exists():
            raise FileNotFoundError(f"이미지 파일을 찾을 수 없습니다: {image_path}")

        encoded = base64.b64encode(image_path.read_bytes()).decode("utf-8")
        return await asyncio.to_thread(self._call_model, encoded, image_path)

    def _call_model(self, image_base64: str, image_path: Path) -> str:
        mime_type, _ = mimetypes.guess_type(image_path.name)
        mime_type = mime_type or "image/png"
        data_url = f"data:{mime_type};base64,{image_base64}"

        prompt = (
            "이미지에 포함된 텍스트를 모두 추출해 주세요. "
            "줄바꿈과 기호를 가능한 한 원문 그대로 유지하고, 추가 설명은 하지 마세요."
        )

        response = self._client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": "You extract text from images and return only the recognized text.",
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                },
            ],
            temperature=0,
        )

        try:
            content = response.choices[0].message.content or ""
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Unexpected OpenAI Vision response payload: %s", response)
            raise RuntimeError("OpenAI Vision 응답을 파싱하지 못했습니다.") from exc

        text = content.strip()
        if not text:
            raise ValueError("OpenAI Vision 응답이 비어 있습니다.")
        return text


class OCRProblemService:
    """이미지 → OpenAI Vision OCR → GPT 풀이 파이프라인."""

    def __init__(
        self,
        *,
        ocr_client: Optional[OpenAIVisionOCRClient] = None,
        prompt_loader: Optional[PromptLoader] = None,
        openai_client: Optional[OpenAIJSONClient] = None,
        data_roots: Optional[Sequence[Path]] = None,
    ) -> None:
        self.ocr_client = ocr_client
        self.prompt_loader = prompt_loader or PromptLoader()
        self.openai_client = openai_client or OpenAIJSONClient()
        roots = list(data_roots) if data_roots else settings.existing_data_roots
        self.data_roots = roots or [settings.project_root / "data"]

    async def solve(self, request: OCRSolveRequest) -> OCRSolveResponse:
        image_path = self._resolve_image_path(request.image_name)
        if not self.ocr_client:
            raise RuntimeError("NAVER OCR 클라이언트가 설정되어 있지 않습니다.")

        logger.info("Starting OCR pipeline for image=%s", image_path)
        extracted_text = await self.ocr_client.extract_text(image_path)
        logger.debug("OCR extracted %s characters", len(extracted_text))

        prompts = self.prompt_loader.load("ocr_solver")
        user_prompt = self._build_user_prompt(prompts["user"], extracted_text, request.image_name)

        logger.debug("Invoking OpenAI model for OCR solution (image=%s)", request.image_name)
        raw_response = await asyncio.to_thread(
            self.openai_client.complete_json,
            prompts["system"],
            user_prompt,
        )
        solution_detail = OCRSolutionDetail.model_validate(raw_response)

        logger.info("Completed OCR solution generation for image=%s", request.image_name)
        return OCRSolveResponse(
            image_name=request.image_name,
            extracted_text=extracted_text,
            problem_analysis=solution_detail.problem_analysis,
            solution_steps=solution_detail.solution_steps,
            final_answer=solution_detail.final_answer,
            concept_review=solution_detail.concept_review,
        )

    def _resolve_image_path(self, image_name: str) -> Path:
        candidate = Path(image_name)
        if candidate.is_absolute() and candidate.exists():
            return candidate

        for root in self.data_roots:
            root_path = root if root.is_absolute() else settings.project_root / root
            image_path = root_path / image_name
            if image_path.exists():
                return image_path

        logger.error("이미지 파일을 찾을 수 없습니다 (image=%s)", image_name)
        raise FileNotFoundError(f"이미지를 찾을 수 없습니다: {image_name}")

    @staticmethod
    def _build_user_prompt(template: str, extracted_text: str, image_name: str) -> str:
        formatted_text = template.replace("{ocr_text}", extracted_text.strip())
        header = f"[이미지 파일명] {image_name}\n"
        return header + formatted_text


def get_ocr_problem_service() -> OCRProblemService:
    ocr_client = OpenAIVisionOCRClient()
    return OCRProblemService(ocr_client=ocr_client)
