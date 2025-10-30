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
      id: "1",
      title: "국어",
      parent_id: null,
      category: "subject",
      duration: "6개월",
      description: "고등학교 1학년 학생을 위한 6개월 국어 집중 로드맵입니다.",
    },
    {
      id: "2",
      title: "입문 단계",
      parent_id: "1",
      category: "title",
      duration: "3주",
      description: "학습 동기를 정비하고 기본 학습 습관을 확립하는 단계입니다.",
    },
    {
      id: "3",
      title: "학습 진단 설계",
      parent_id: "2",
      category: "topic",
      duration: "1주",
      description:
        "초기 진단 문항과 체크리스트를 활용해 학습 수준을 분석합니다.",
    },
    {
      id: "4",
      title: "(선택) 학습 목표 코칭",
      parent_id: "3",
      category: "topic",
      duration: "1주",
      description: "(선택) 상담 기법을 활용해 개인별 학습 목표를 정교화합니다.",
    },
    {
      id: "5",
      title: "기초 어휘 진단",
      parent_id: "2",
      category: "topic",
      duration: "1주",
      description: "빈도 높은 어휘 리스트를 진단해 취약 영역을 확인합니다.",
    },
    {
      id: "6",
      title: "주간 계획 템플릿 작성",
      parent_id: "5",
      category: "topic",
      duration: "1주",
      description: "학습-복습-피드백을 포함한 주간 학습 템플릿을 설계합니다.",
    },
    {
      id: "7",
      title: "(선택) 학습 루틴 피드백",
      parent_id: "2",
      category: "topic",
      duration: "1주",
      description: "(선택) 주간 루틴을 점검하고 개선 포인트를 반영합니다.",
    },
    {
      id: "8",
      title: "기초 역량 강화 단계",
      parent_id: "2",
      category: "title",
      duration: "4주",
      description: "품사와 문장 성분을 중심으로 국어 문법 기초를 강화합니다.",
    },
    {
      id: "9",
      title: "품사 핵심 복습",
      parent_id: "8",
      category: "topic",
      duration: "1주",
      description: "품사의 개념과 쓰임을 정리하고 예시 문장을 분석합니다.",
    },
    {
      id: "10",
      title: "품사 비교 문제 풀이",
      parent_id: "9",
      category: "topic",
      duration: "1주",
      description: "품사 혼동 사례를 문제 풀이로 구분하는 연습을 합니다.",
    },
    {
      id: "11",
      title: "문장 성분 구조도",
      parent_id: "8",
      category: "topic",
      duration: "1주",
      description: "문장 성분의 역할을 구조도로 시각화합니다.",
    },
    {
      id: "12",
      title: "(선택) 문장 변형 연습",
      parent_id: "11",
      category: "topic",
      duration: "1주",
      description: "(선택) 문장 성분을 바꾸어 의미 변화를 확인합니다.",
    },
    {
      id: "13",
      title: "호응 오류 점검",
      parent_id: "11",
      category: "topic",
      duration: "1주",
      description: "자주 틀리는 호응 오류를 유형별로 점검합니다.",
    },
    {
      id: "14",
      title: "핵심 독해 전략 단계",
      parent_id: "8",
      category: "title",
      duration: "4주",
      description: "비문학 지문을 중심으로 핵심 독해 전략을 학습합니다.",
    },
    {
      id: "15",
      title: "비문학 구조 파악",
      parent_id: "14",
      category: "topic",
      duration: "1주",
      description: "문단 전개 방식과 핵심 문장을 파악합니다.",
    },
    {
      id: "16",
      title: "정보형 지문 분석",
      parent_id: "15",
      category: "topic",
      duration: "1주",
      description: "표·그래프가 포함된 정보를 읽고 요약합니다.",
    },
    {
      id: "17",
      title: "추론형 질문 만들기",
      parent_id: "16",
      category: "topic",
      duration: "1주",
      description: "추론이 필요한 질문을 설계하고 근거를 제시합니다.",
    },
    {
      id: "18",
      title: "(선택) 시사 자료 토론",
      parent_id: "15",
      category: "topic",
      duration: "1주",
      description: "(선택) 시사 텍스트를 읽고 토론 질문을 구성합니다.",
    },
    {
      id: "19",
      title: "요약 및 핵심 문장 정리",
      parent_id: "16",
      category: "topic",
      duration: "1주",
      description: "핵심 문장을 추출하고 요약문을 작성합니다.",
    },
    {
      id: "20",
      title: "문학 탐구 단계",
      parent_id: "14",
      category: "title",
      duration: "4주",
      description: "현대시, 소설, 희곡, 고전을 탐구하며 감상 역량을 높입니다.",
    },
    {
      id: "21",
      title: "현대시 이미지 분석",
      parent_id: "20",
      category: "topic",
      duration: "1주",
      description: "현대시의 이미지와 상징을 분석합니다.",
    },
    {
      id: "22",
      title: "현대소설 갈등 구조",
      parent_id: "21",
      category: "topic",
      duration: "1주",
      description: "인물 간 갈등을 구조적으로 파악합니다.",
    },
    {
      id: "23",
      title: "(선택) 인물 감정 다이어리",
      parent_id: "21",
      category: "topic",
      duration: "1주",
      description: "(선택) 인물 감정을 일지 형태로 정리합니다.",
    },
    {
      id: "24",
      title: "희곡 장면 읽기",
      parent_id: "20",
      category: "topic",
      duration: "1주",
      description: "희곡의 무대 지시문과 장면 전개를 이해합니다.",
    },
    {
      id: "25",
      title: "고전 문학 배경 조사",
      parent_id: "24",
      category: "topic",
      duration: "1주",
      description: "고전 작품의 시대 배경과 표현 기법을 조사합니다.",
    },
    {
      id: "26",
      title: "표현력 심화 단계",
      parent_id: "20",
      category: "title",
      duration: "4주",
      description: "논증 글쓰기와 발표를 통해 표현력을 심화합니다.",
    },
    {
      id: "27",
      title: "논증 글쓰기 구조 설계",
      parent_id: "26",
      category: "topic",
      duration: "1주",
      description: "논증 글의 구조를 설계하고 개요를 작성합니다.",
    },
    {
      id: "28",
      title: "주장-근거 배열 연습",
      parent_id: "27",
      category: "topic",
      duration: "1주",
      description: "주장과 근거를 논리적으로 배열하는 연습을 합니다.",
    },
    {
      id: "29",
      title: "(선택) 토론 기록 재구성",
      parent_id: "27",
      category: "topic",
      duration: "1주",
      description: "(선택) 토론 내용을 글쓰기 자료로 재구성합니다.",
    },
    {
      id: "30",
      title: "설득형 글 초안 작성",
      parent_id: "28",
      category: "topic",
      duration: "1주",
      description: "설득형 글 초안을 작성하고 논지를 정리합니다.",
    },
    {
      id: "31",
      title: "피드백 반영 수정",
      parent_id: "28",
      category: "topic",
      duration: "1주",
      description: "피드백을 반영해 글을 수정하고 완성도를 높입니다.",
    },
    {
      id: "32",
      title: "검증 및 확장 단계",
      parent_id: "26",
      category: "title",
      duration: "4주",
      description: "모의 평가와 확장 활동으로 학습 성과를 검증합니다.",
    },
    {
      id: "33",
      title: "모의고사 유형 분석",
      parent_id: "32",
      category: "topic",
      duration: "1주",
      description: "최근 기출을 분석해 자주 등장하는 유형을 파악합니다.",
    },
    {
      id: "34",
      title: "오답 패턴 기록",
      parent_id: "33",
      category: "topic",
      duration: "1주",
      description: "오답 원인을 기록하고 보완 전략을 세웁니다.",
    },
    {
      id: "35",
      title: "실전 독해 훈련",
      parent_id: "34",
      category: "topic",
      duration: "1주",
      description: "실전 속도와 정확도를 끌어올리는 독해 훈련을 합니다.",
    },
    {
      id: "36",
      title: "(선택) 심화 자료 탐색",
      parent_id: "33",
      category: "topic",
      duration: "1주",
      description: "(선택) 관심 주제의 심화 자료를 탐색하고 요약합니다.",
    },
    {
      id: "37",
      title: "학습 포트폴리오 정리",
      parent_id: "33",
      category: "topic",
      duration: "1주",
      description: "결과물을 정리해 학습 포트폴리오를 완성합니다.",
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
