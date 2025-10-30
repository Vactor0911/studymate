"""텍스트 처리 유틸리티"""

from __future__ import annotations


def summarize_text(text: str, limit: int = 160) -> str:
    """
    텍스트를 지정된 길이로 요약합니다.
    
    Args:
        text: 요약할 텍스트
        limit: 최대 길이 (기본값: 160)
        
    Returns:
        요약된 텍스트
    """
    normalized = " ".join(text.strip().split())
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 3] + "..."


def slugify(value: str) -> str:
    """
    문자열을 URL 친화적인 slug로 변환합니다.
    
    Args:
        value: 변환할 문자열
        
    Returns:
        slug 문자열
    """
    normalized = "".join(ch if ch.isalnum() else "-" for ch in value.lower())
    normalized = "-".join(filter(None, normalized.split("-")))
    return normalized or "node"
