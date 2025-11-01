from __future__ import annotations

from typing import Any, Dict, Iterable, Iterator, List, Optional

from pydantic import BaseModel, Field, field_validator


class RoadmapResource(BaseModel):
    """참고 자료, 문제 세트 등 노드에 연결되는 리소스 정의."""

    type: str = Field(..., description="resource type (e.g. passage, problem, video)")
    label: str = Field(..., description="human friendly label")
    source_id: str = Field(..., description="source identifier or path")
    metadata: Dict[str, Any] = Field(default_factory=dict)


class RoadmapNode(BaseModel):
    """로드맵의 단일 노드."""

    node_id: str
    title: str
    objective: str
    summary: Optional[str] = None
    difficulty: Optional[str] = None
    achievement_codes: List[str] = Field(default_factory=list)
    parent_id: Optional[str] = None
    child_ids: List[str] = Field(default_factory=list)
    resources: List[RoadmapResource] = Field(default_factory=list)

    def attach_child(self, child_id: str) -> None:
        if child_id not in self.child_ids:
            self.child_ids.append(child_id)

    def attach_resource(self, resource: RoadmapResource) -> None:
        self.resources.append(resource)


class Roadmap(BaseModel):
    """노드 사전을 기반으로 한 간단한 로드맵 그래프 표현."""

    nodes: Dict[str, RoadmapNode] = Field(default_factory=dict)
    root_id: Optional[str] = None

    def add_node(self, node: RoadmapNode, *, as_root: bool = False) -> None:
        self.nodes[node.node_id] = node
        if self.root_id is None or as_root:
            self.root_id = node.node_id

    def link(self, parent_id: str, child_id: str) -> None:
        parent = self._require_node(parent_id)
        child = self._require_node(child_id)
        parent.attach_child(child_id)
        child.parent_id = parent_id

    def get_node(self, node_id: str) -> RoadmapNode:
        return self._require_node(node_id)

    def get_children(self, node_id: str) -> List[RoadmapNode]:
        node = self._require_node(node_id)
        return [self._require_node(cid) for cid in node.child_ids]

    def get_ancestors(self, node_id: str) -> List[RoadmapNode]:
        ancestors: List[RoadmapNode] = []
        current = self._require_node(node_id)
        while current.parent_id:
            current = self._require_node(current.parent_id)
            ancestors.append(current)
        return ancestors

    def depth_first(self, start_id: Optional[str] = None) -> Iterator[RoadmapNode]:
        root_id = start_id or self.root_id
        if not root_id:
            return iter(())

        def _walk(node_id: str) -> Iterator[RoadmapNode]:
            node = self._require_node(node_id)
            yield node
            for child_id in node.child_ids:
                yield from _walk(child_id)

        return _walk(root_id)

    def as_tree(self, start_id: Optional[str] = None) -> Dict[str, Any]:
        root_id = start_id or self.root_id
        if not root_id:
            return {}

        def _to_tree(node_id: str) -> Dict[str, Any]:
            node = self._require_node(node_id)
            return {
                "node": node.model_dump(mode="json"),
                "children": [_to_tree(child_id) for child_id in node.child_ids],
            }

        return _to_tree(root_id)

    def update_node(self, node_id: str, **updates: Any) -> None:
        node = self._require_node(node_id)
        updated = node.model_copy(update=updates)
        self.nodes[node_id] = updated

    def _require_node(self, node_id: str) -> RoadmapNode:
        if node_id not in self.nodes:
            raise KeyError(f"Node not found: {node_id}")
        return self.nodes[node_id]
