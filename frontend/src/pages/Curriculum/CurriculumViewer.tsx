import { Box, useTheme } from "@mui/material";
import {
  Controls,
  ReactFlow,
  type ReactFlowInstance,
  Position,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { JSX } from "@emotion/react/jsx-runtime";
import { useParams } from "react-router";
import CurriculumLegend from "./CurriculumLegend";

// 로드맵 데이터 타입
interface NodeData {
  id: number | string;
  title: string;
  parent_id: number | string | null;
  isOptional?: boolean;
  category?: string;
}

// 노드 데이터 타입
interface Node {
  id: string;
  type?: string;
  data: { label: JSX.Element | string };
  position: { x: number; y: number };
  sourcePosition?: Position;
  targetPosition?: Position;
  style: {
    backgroundColor: string;
    border: string;
    color: string;
    boxShadow?: string;
  };
  width?: number;
}

// 엣지 데이터 타입
interface Edge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

const CurriculumViewer = ({
  onNodeDetail,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNodeDetail: (detail: any, loading: boolean) => void;
}) => {
  const theme = useTheme();
  const { uuid } = useParams<{ uuid: string }>(); // URL에서 워크스페이스 UUID 가져오기

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [roadmapData, setRoadmapData] = useState<NodeData[]>([
    { "id": 1, "title": "웹 애플리케이션 개발자", "parent_id": null, "isOptional": false, "category": "job" },
    { "id": 2, "title": "기초", "parent_id": 1, "isOptional": false, "category": "stage" },
    { "id": 3, "title": "기본 연산과 방정식을 학습합니다", "parent_id": 2, "isOptional": false, "category": "skill" },
    { "id": 4, "title": "관동별곡의 장면을 시각화하고 친구들과 감상을 나눕니다.", "parent_id": 2, "isOptional": false, "category": "skill" },
    { "id": 5, "title": "버전 관리(Git)", "parent_id": 2, "isOptional": false, "category": "skill" },
    { "id": 6, "title": "웹 기초", "parent_id": 2, "isOptional": false, "category": "skill" },
    { "id": 7, "title": "핵심", "parent_id": 2, "isOptional": false, "category": "stage" },
    { "id": 8, "title": "JavaScript 심화", "parent_id": 7, "isOptional": false, "category": "skill" },
    { "id": 9, "title": "비동기 처리", "parent_id": 8, "isOptional": false, "category": "skill" },
    { "id": 10, "title": "DOM 조작", "parent_id": 8, "isOptional": false, "category": "skill" },
    { "id": 11, "title": "프론트엔드 프레임워크", "parent_id": 7, "isOptional": false, "category": "skill" },
    { "id": 12, "title": "React", "parent_id": 11, "isOptional": true, "category": "skill" },
    { "id": 13, "title": "Vue.js", "parent_id": 11, "isOptional": true, "category": "skill" },
    { "id": 14, "title": "백엔드 언어", "parent_id": 7, "isOptional": false, "category": "skill" },
    { "id": 15, "title": "Node.js", "parent_id": 14, "isOptional": true, "category": "skill" },
    { "id": 16, "title": "Python", "parent_id": 14, "isOptional": true, "category": "skill" },
    { "id": 17, "title": "데이터베이스", "parent_id": 7, "isOptional": false, "category": "skill" },
    { "id": 18, "title": "MySQL", "parent_id": 17, "isOptional": true, "category": "skill" },
    { "id": 19, "title": "MongoDB", "parent_id": 17, "isOptional": true, "category": "skill" },
    { "id": 20, "title": "심화", "parent_id": 7, "isOptional": false, "category": "stage" },
    { "id": 21, "title": "풀스택 개발", "parent_id": 20, "isOptional": false, "category": "skill" },
    { "id": 22, "title": "RESTful API", "parent_id": 21, "isOptional": false, "category": "skill" },
    { "id": 23, "title": "GraphQL", "parent_id": 21, "isOptional": true, "category": "skill" },
    { "id": 24, "title": "테스트 및 배포", "parent_id": 20, "isOptional": false, "category": "skill" },
    { "id": 25, "title": "Jest", "parent_id": 24, "isOptional": true, "category": "skill" },
    { "id": 26, "title": "CI/CD", "parent_id": 24, "isOptional": false, "category": "skill" },
    { "id": 27, "title": "고급", "parent_id": 20, "isOptional": false, "category": "stage" },
    { "id": 28, "title": "클라우드 서비스", "parent_id": 27, "isOptional": false, "category": "skill" },
    { "id": 29, "title": "AWS", "parent_id": 28, "isOptional": true, "category": "skill" },
    { "id": 30, "title": "Azure", "parent_id": 28, "isOptional": true, "category": "skill" },
    { "id": 31, "title": "DevOps", "parent_id": 27, "isOptional": false, "category": "skill" },
    { "id": 32, "title": "Docker", "parent_id": 31, "isOptional": false, "category": "skill" },
    { "id": 33, "title": "Kubernetes", "parent_id": 31, "isOptional": true, "category": "skill" },
    { "id": 34, "title": "전문", "parent_id": 27, "isOptional": false, "category": "stage" },
    { "id": 35, "title": "프로젝트 관리", "parent_id": 34, "isOptional": false, "category": "skill" },
    { "id": 36, "title": "Agile", "parent_id": 35, "isOptional": false, "category": "skill" },
    { "id": 37, "title": "Scrum", "parent_id": 35, "isOptional": true, "category": "skill" },
    { "id": 38, "title": "특화 기술", "parent_id": 34, "isOptional": false, "category": "skill" },
    { "id": 39, "title": "AI 통합", "parent_id": 38, "isOptional": true, "category": "skill" },
    { "id": 40, "title": "IoT 애플리케이션", "parent_id": 38, "isOptional": true, "category": "skill" },
    { "id": 41, "title": "정보처리기사", "parent_id": 4, "isOptional": false, "category": "certificate" },
    { "id": 42, "title": "AWS 인증", "parent_id": 29, "isOptional": true, "category": "certificate" },
    { "id": 43, "title": "Azure 인증", "parent_id": 30, "isOptional": true, "category": "certificate" }]);
  const reactFlowInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  // 노드 배경색 추출
  const getNodeBackgroundColor = useCallback(
    (category: string) => {
      switch (category) {
        case "job":
        case "stage":
          return theme.palette.primary.main;
        case "certificate":
          return theme.palette.secondary.light;
        default:
          return "inherit"; // 기본 배경색
      }
    },
    [theme.palette]
  );

  // 노드 구성
  const createNodes = useCallback(
    (data: NodeData[]) => {
      const nodes: Node[] = data.map((node) => ({
        id: `node-${node.id}`,
        data: {
          label:
            node.category === "job" || node.category === "stage" ? (
              <div
                css={{
                  display: "flex",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  css={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    color: "white",
                    wordBreak: "keep-all",
                    textWrap: "balance",
                  }}
                >
                  {node.title}
                </span>
              </div>
            ) : (
              <div
                css={{
                  display: "flex",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span
                  css={{
                    wordBreak: "keep-all",
                    textWrap: "balance",
                    textAlign: "left",
                    marginLeft: "0.5em",
                  }}
                >
                  {node.title}
                </span>
              </div>
            ),
        },
        position: { x: 0, y: 0 }, // 초기 위치는 나중에 조정
        width: 150,
        style: {
          padding: "10px 0",
          backgroundColor: getNodeBackgroundColor(node.category || "default"),
          border:
            node.category === "skill"
              ? `2px solid ${theme.palette.primary.main}`
              : "2px solid black",
          color:
            node.category === "job" || node.category === "stage"
              ? "white"
              : "black",
        },
      }));

      // 자식 노드가 없는 노드의 타입을 "output"으로 설정
      const parentIdSet = new Set(
        data.map((n) => n.parent_id).filter((id) => id !== null)
      );
      nodes.forEach((node) => {
        const nodeData = data.find((d) => `node-${d.id}` === node.id);

        if (!nodeData) {
          // 노드 데이터가 없는 경우
          return;
        } else if (nodeData.category === "job") {
          // category가 "job"인 경우
          node.type = "input";
        } else if (!parentIdSet.has(nodeData.id)) {
          // 자식 노드가 없는 경우
          node.type = "output";
        }
      });

      return nodes;
    },
    [getNodeBackgroundColor, theme.palette.primary.main]
  );

  // 노드 위치 조정
  const adjustNodePositions = useCallback(
    (nodes: Node[]) => {
      // id와 parent_id 매핑
      const idToNode = new Map();
      roadmapData.forEach((node: NodeData) =>
        idToNode.set(`node-${node.id}`, node)
      );

      // 트리 구조 생성 (children 정보 추가)
      const childrenMap: Record<string, string[]> = {};
      roadmapData.forEach((node) => {
        if (node.parent_id) {
          const parentKey = `node-${node.parent_id}`;
          if (!childrenMap[parentKey]) childrenMap[parentKey] = [];
          childrenMap[parentKey].push(`node-${node.id}`);
        }
      });

      // 단계 카테고리 노드 찾기
      const stageNodes = nodes.filter((node) => {
        const data = idToNode.get(node.id);
        return data?.category === "stage";
      });

      // 재귀적으로 위치 계산
      let currentY = 1;
      const nodePositions: Record<string, { x: number; y: number }> = {};

      const setPositions = (
        nodeId: string,
        depth: number,
        direction: number
      ) => {
        const children = childrenMap[nodeId] || [];

        // 노드 엣지 위치 수정
        const nodeData = nodes.find((n) => n.id === nodeId);
        if (nodeData) {
          nodeData.sourcePosition =
            direction === 1 ? Position.Right : Position.Left;
          nodeData.targetPosition =
            direction === 1 ? Position.Left : Position.Right;
        }

        if (children.length === 0) {
          // 리프 노드를 현재 y에 위치
          nodePositions[nodeId] = {
            x: depth * 200 * direction,
            y: currentY * 80,
          };
          currentY += 1;
        } else {
          // 자식 먼저 배치
          const childXs: number[] = [];
          children
            .filter((child) => idToNode.get(child)?.category !== "stage")
            .forEach((childId) => {
              setPositions(childId, depth + 1, direction);
              childXs.push(nodePositions[childId].y);
            });

          // 부모는 자식들의 x의 중앙에 위치
          const minX = Math.min(...childXs);
          const maxX = Math.max(...childXs);
          nodePositions[nodeId] = {
            x: depth * 200 * direction,
            y: (minX + maxX) / 2,
          };
        }
      };

      // 각 단계 노드를 중심으로 좌우로 배치
      stageNodes.forEach((node, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        setPositions(node.id, 0, direction);

        node.sourcePosition = direction === 1 ? Position.Right : Position.Left;
        node.targetPosition = Position.Top;
      });

      // 노드에 position 할당
      return nodes.map((node) => ({
        ...node,
        position: nodePositions[node.id] || { x: 0, y: 0 },
      }));
    },
    [roadmapData]
  );

  // 엣지 구성
  const createEdges = useCallback((data: NodeData[]) => {
    return data.map((node, index) => ({
      id: `edge-${index}`,
      source: `node-${node.parent_id}`,
      target: `node-${node.id}`,
      animated: node.isOptional || false,
    }));
  }, []);

  // 노드로 시점 이동
  const fitViewToNode = useCallback((nodeId: string, zoomLevel = 1.5) => {
    // reactFlowInstance 참조
    const instance = reactFlowInstance.current;
    if (!instance) return;

    // 선택한 노드 가져오기
    const node = instance.getNode(nodeId);
    if (!node) return;

    // 노드를 가운데로 이동
    const centerX = node.position.x + (node.width ? node.width / 2 : 0);
    const centerY = node.position.y;

    instance.setCenter(centerX, centerY, { zoom: zoomLevel, duration: 800 });
  }, []);

  // 노드 및 엣지 초기화
  useEffect(() => {
    // 노드 생성
    const newNodes = createNodes(roadmapData);
    const adjustedNodes = adjustNodePositions(newNodes);
    setNodes(adjustedNodes);

    // 엣지 생성
    const newEdges = createEdges(roadmapData);
    setEdges(newEdges);
  }, [adjustNodePositions, createEdges, createNodes, roadmapData]);

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback(
    async (_: unknown, node: Node) => {
      fitViewToNode(node.id); // 1. 시점 이동

      // 노드의 카테고리가 "job" 또는 "stage"인 경우 상세정보를 불러오지 않음
      const selectedNode = roadmapData.find(
        (n) =>
          `node-${n.id}` === node.id &&
          n.category !== "job" &&
          n.category !== "stage"
      );
      if (!selectedNode) {
        onNodeDetail(null, false); // 상세정보 없음
        return;
      }

      // 상세정보 API 호출
      const nodeId = node.id.replace("node-", "");
      onNodeDetail(null, true); // 로딩 시작

      // TODO: 노드 상세정보 API 호출
    },
    [fitViewToNode, roadmapData, onNodeDetail]
  );

  return (
    <Box width="100%" height="100%" position="relative">
      {/* 로드맵 레전드 */}
      <CurriculumLegend />

      {/* 로드맵 플로우 */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onNodeClick={handleNodeClick}
        disableKeyboardA11y
        nodesConnectable={false}
        nodesDraggable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        fitView
        fitViewOptions={{
          nodes: [{ id: "node-1" }],
          padding: 0.1,
          duration: 800,
          maxZoom: 0.75,
        }}
      >
        <Controls
          showInteractive={false}
          fitViewOptions={{
            nodes: [{ id: "node-1" }],
            padding: 0.1,
            duration: 800,
            maxZoom: 0.75,
          }}
        />
      </ReactFlow>
    </Box>
  );
};

export default CurriculumViewer;
