import { atom } from "jotai";
import type { RefObject } from "react";

// 헤더 ref 요소
export const headerRefAtom = atom<RefObject<HTMLDivElement | null> | null>(null);

// 로드맵 뷰어 상태
export const roadmapTabAtom = atom(1);
