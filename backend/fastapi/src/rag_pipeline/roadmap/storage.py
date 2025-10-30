from __future__ import annotations

import json
from pathlib import Path

from .models import Roadmap


def save_roadmap(roadmap: Roadmap, path: Path, *, indent: int = 2) -> Path:
    """로드맵을 JSON 파일로 저장."""
    path.parent.mkdir(parents=True, exist_ok=True)
    data = roadmap.model_dump(mode="json")
    path.write_text(json.dumps(data, ensure_ascii=False, indent=indent), encoding="utf-8")
    return path


def load_roadmap(path: Path) -> Roadmap:
    """JSON 파일에서 로드맵을 읽어온다."""
    data = json.loads(path.read_text(encoding="utf-8"))
    return Roadmap.model_validate(data)
