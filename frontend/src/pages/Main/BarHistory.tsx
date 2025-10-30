import { Stack, useTheme } from "@mui/material";
import BarButton from "./BarButton";
import { useCallback, useState } from "react";
import InfoPopover from "./InfoPopover";
import { useAtomValue } from "jotai";
import { selectedBarAtom } from "../../states";

type SelectedDataType = {
  grade: string;
  subject: string;
  focusContent: string;
  targetContent: string;
};

const DATA = [
  {
    grade: "고등학교 1학년",
    subject: "국어",
    focusContent: "학습 목표 정리",
    targetContent:
      "학습 목표를 정리하고 고등 국어 학습 습관을 세우는 단계입니다.",
  },
  {
    grade: "고등학교 1학년",
    subject: "국어",
    focusContent: "기초 문법 개요",
    targetContent: "품사와 문장 성분에 대한 기초 개념을 정리합니다.",
  },
  {
    grade: "고등학교 1학년",
    subject: "국어",
    focusContent: "품사별 기능 이해",
    targetContent: "주요 품사의 기능과 활용 예시를 정리합니다.",
  },
  {
    grade: "고등학교 1학년",
    subject: "국어",
    focusContent: "품사 비교 연습",
    targetContent: "품사별 차이점을 문제 풀이로 연습합니다.",
  },
  {
    grade: "고등학교 1학년",
    subject: "국어",
    focusContent: "문장 성분 분석",
    targetContent: "문장 성분과 호응 관계를 분석하여 문장 구조를 파악합니다.",
  },
] as SelectedDataType[];

const BarHistory = () => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const selectedBar = useAtomValue(selectedBarAtom);
  const [data] = useState<SelectedDataType[]>(DATA);

  const processColor = useCallback(
    (origin: string, index: string) => {
      const selectedBarNum = Number(selectedBar);
      const indexNum = Number(index);

      if (indexNum < selectedBarNum) {
        return theme.palette.secondary.light;
      }
      return origin;
    },
    [selectedBar, theme.palette.secondary.light]
  );

  return (
    <Stack
      direction="row"
      width="100%"
      height="100%"
      alignItems="flex-end"
      gap="5vw"
    >
      <BarButton
        label="01"
        color={processColor("#A5E9E2", "01")}
        mb={15}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="02"
        color={processColor("#3FD4C7", "02")}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="03"
        color={processColor("#3FD4C7", "03")}
        mb={15}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="04"
        color={processColor("#3D8BEB", "04")}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="05"
        color={processColor("#6574FF", "05")}
        mb={15}
        setAnchor={setAnchorEl}
      />

      <InfoPopover
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        grade={selectedBar && data[Number(selectedBar) - 1].grade}
        subject={selectedBar && data[Number(selectedBar) - 1].subject}
        focusContent={selectedBar && data[Number(selectedBar) - 1].focusContent}
        targetContent={selectedBar && data[Number(selectedBar) - 1].targetContent}
      />
    </Stack>
  );
};

export default BarHistory;
