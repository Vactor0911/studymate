from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional

import yaml

from rag_pipeline.config import resolve_path


@dataclass
class PromptTemplate:
    """프롬프트 템플릿 데이터 클래스"""
    name: str
    role: str
    content: str
    version: str


class PromptLoader:
    """
    프롬프트 템플릿을 로드하는 통합 클래스
    
    두 가지 형식을 지원합니다:
    1. Dict 형식: {"system": "...", "user": "..."}
    2. PromptTemplate 객체: 단일 content 필드
    """
    
    def load(self, template_name: str) -> Dict[str, str]:
        """
        프롬프트 템플릿을 Dict 형식으로 로드합니다.
        
        Args:
            template_name: 템플릿 파일명 (확장자 제외)
            
        Returns:
            프롬프트 딕셔너리 (system, user 키 포함)
        """
        file_name = f"{template_name}.yaml"
        prompt_path = resolve_path("prompts", file_name)
        
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with prompt_path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        
        return {
            "system": data.get("system", ""),
            "user": data.get("user", ""),
        }
    
    def load_template(self, file_name: str) -> PromptTemplate:
        """
        프롬프트 템플릿을 PromptTemplate 객체로 로드합니다.
        
        Args:
            file_name: 템플릿 파일명 (확장자 포함)
            
        Returns:
            PromptTemplate 객체
        """
        prompt_path = resolve_path("prompts", file_name)
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

        with prompt_path.open("r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

        return PromptTemplate(
            name=data.get("name", prompt_path.stem),
            role=data.get("role", "system"),
            content=data["content"],
            version=data.get("version", "v1"),
        )


# 하위 호환성을 위한 함수 (deprecated)
def load_prompt(file_name: str) -> PromptTemplate:
    """
    레거시 함수. PromptLoader.load_template() 사용 권장.
    
    Args:
        file_name: 템플릿 파일명
        
    Returns:
        PromptTemplate 객체
    """
    loader = PromptLoader()
    return loader.load_template(file_name)
