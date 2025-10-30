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
  duration?: string;
  description?: string;
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
  const [roadmapData] = useState<NodeData[]>([
    {
      id: 1,
      title: "국어",
      parent_id: null,
      category: "subject",
      duration: "6개월",
      description: "고등학교 1학년 국어 과목을 전반적으로 학습합니다",
    },
    {
      id: 2,
      title: "입문 단계",
      parent_id: 1,
      category: "title",
      duration: "1개월",
      description: "국어의 기본 개념을 학습합니다",
    },
    {
      id: 3,
      title: "문법 기초",
      parent_id: 2,
      category: "topic",
      duration: "2주",
      description: "국어 문법의 기본적인 개념을 익힙니다",
    },
    {
      id: 4,
      title: "명사",
      parent_id: 3,
      category: "topic",
      duration: "1주",
      description: "명사의 정의와 종류를 학습합니다",
    },
    {
      id: 5,
      title: "동사",
      parent_id: 4,
      category: "topic",
      duration: "1주",
      description: "동사의 활용과 종류를 학습합니다",
    },
    {
      id: 6,
      title: "형용사",
      parent_id: 5,
      category: "topic",
      duration: "1주",
      description: "형용사의 역할과 활용을 학습합니다",
    },
    {
      id: 7,
      title: "기초 단계",
      parent_id: 6,
      category: "title",
      duration: "1개월",
      description: "어휘력과 독해력을 강화합니다",
    },
    {
      id: 8,
      title: "기본 어휘",
      parent_id: 7,
      category: "topic",
      duration: "1주",
      description: "기본적인 국어 어휘를 습득합니다",
    },
    {
      id: 9,
      title: "독해 기초",
      parent_id: 8,
      category: "topic",
      duration: "2주",
      description: "문장의 구조와 독해 기법을 학습합니다",
    },
    {
      id: 10,
      title: "문장 이해",
      parent_id: 9,
      category: "topic",
      duration: "1주",
      description: "문장의 의미와 구조를 이해합니다",
    },
    {
      id: 11,
      title: "핵심 단계",
      parent_id: 10,
      category: "title",
      duration: "1개월",
      description: "국어의 핵심 개념을 심도 있게 학습합니다",
    },
    {
      id: 12,
      title: "작문 기초",
      parent_id: 11,
      category: "topic",
      duration: "2주",
      description: "작문의 기본 원칙과 방법을 학습합니다",
    },
    {
      id: 13,
      title: "서술형 작성",
      parent_id: 12,
      category: "topic",
      duration: "1주",
      description: "서술형 문제의 작성 방법을 학습합니다",
    },
    {
      id: 14,
      title: "비문학 독해",
      parent_id: 13,
      category: "topic",
      duration: "2주",
      description: "비문학 지문 분석 및 이해를 학습합니다",
    },
    {
      id: 15,
      title: "문학 감상",
      parent_id: 14,
      category: "topic",
      duration: "1주",
      description: "문학 작품의 감상 방법을 학습합니다",
    },
    {
      id: 16,
      title: "심화 단계",
      parent_id: 15,
      category: "title",
      duration: "1개월",
      description: "심화된 국어 지식과 능력을 배양합니다",
    },
    {
      id: 17,
      title: "문학의 이해",
      parent_id: 16,
      category: "topic",
      duration: "2주",
      description: "문학의 다양한 장르와 특성을 학습합니다",
    },
    {
      id: 18,
      title: "고전 문학",
      parent_id: 17,
      category: "topic",
      duration: "2주",
      description: "고전 문학의 분석과 이해를 학습합니다",
    },
    {
      id: 19,
      title: "현대 문학",
      parent_id: 18,
      category: "topic",
      duration: "2주",
      description: "현대 문학 작품의 특징과 분석을 학습합니다",
    },
    {
      id: 20,
      title: "고급 단계",
      parent_id: 19,
      category: "title",
      duration: "1개월",
      description: "국어 능력을 고급 수준으로 향상시킵니다",
    },
    {
      id: 21,
      title: "수필 작성",
      parent_id: 20,
      category: "topic",
      duration: "1주",
      description: "수필의 구조와 작성 방법을 학습합니다",
    },
    {
      id: 22,
      title: "시의 이해",
      parent_id: 21,
      category: "topic",
      duration: "1주",
      description: "시의 형식과 표현법을 학습합니다",
    },
    {
      id: 23,
      title: "비평적 사고",
      parent_id: 22,
      category: "topic",
      duration: "2주",
      description: "비평적 사고를 통해 텍스트를 분석합니다",
    },
    {
      id: 24,
      title: "창의적 작문",
      parent_id: 23,
      category: "topic",
      duration: "2주",
      description: "창의적인 아이디어를 바탕으로 글을 작성합니다",
    },
    {
      id: 25,
      title: "연극 대본",
      parent_id: 24,
      category: "topic",
      duration: "1주",
      description: "연극 대본의 작성 방법을 학습합니다",
    },
    {
      id: 26,
      title: "토론 및 발표",
      parent_id: 25,
      category: "topic",
      duration: "2주",
      description: "토론 기술과 발표 능력을 배양합니다",
    },
    {
      id: 27,
      title: "문학과 사회",
      parent_id: 26,
      category: "topic",
      duration: "2주",
      description: "문학 작품이 사회에 미치는 영향을 탐구합니다",
    },
    {
      id: 28,
      title: "언어와 사고",
      parent_id: 27,
      category: "topic",
      duration: "2주",
      description: "언어가 사고에 미치는 영향을 학습합니다",
    },
    {
      id: 29,
      title: "고급 작문",
      parent_id: 28,
      category: "topic",
      duration: "2주",
      description: "복잡한 글쓰기 기법을 심도 있게 학습합니다",
    },
    {
      id: 30,
      title: "문학 비평",
      parent_id: 29,
      category: "topic",
      duration: "2주",
      description: "문학 작품을 비평하는 방법을 학습합니다",
    },
  ]);
  const reactFlowInstance = useRef<ReactFlowInstance<Node, Edge> | null>(null);

  // 노드 배경색 추출
  const getNodeBackgroundColor = useCallback(
    (category: string) => {
      switch (category) {
        case "subject":
        case "title":
          return theme.palette.primary.main;
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
            node.category === "subject" || node.category === "title" ? (
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
            node.category === "topic"
              ? `2px solid ${theme.palette.primary.main}`
              : "2px solid black",
          color:
            node.category === "subject" || node.category === "title"
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
        } else if (nodeData.category === "subject") {
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
      console.log(childrenMap);

      // 단계 카테고리 노드 찾기
      const stageNodes = nodes.filter((node) => {
        const data = idToNode.get(node.id);
        return data?.category === "title";
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
            .filter((child) => idToNode.get(child)?.category !== "title")
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
          n.category !== "subject" &&
          n.category !== "title"
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
