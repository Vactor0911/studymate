import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import ResultChart from "./ResultChart";
import { useCallback, useEffect, useRef, useState } from "react";
import MarkedItem from "./MarkedItem";
import Analyze from "./Analyze";
import AnalyzeResult from "./AnalyzeResult";
import { useAtomValue } from "jotai";
import { answerAtom, AssessmentDataAtom, userSelectAtom } from "../../states";

const Result = () => {
  const theme = useTheme();

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const pieContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState(200);
  const AssessmentData = useAtomValue(AssessmentDataAtom);
  const userSelect = useAtomValue(userSelectAtom);
  const answer = useAtomValue(answerAtom);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    if (pieContainerRef.current) {
      setChartSize(pieContainerRef.current.clientHeight * 0.65);
    }
  }, []);

  // 분석하기 버튼 클릭
  const handleAnalyzeButtonClick = useCallback(() => {
    setIsAnalyzed(true);
  }, []);

  return (
    <Stack
      sx={{
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Stack py={15} pb={5} gap={3}>
          {/* 성적표 정보 */}
          <Stack direction="row" gap={2} flexWrap="wrap">
            {/* 날짜 */}
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              p={1.5}
              px={2}
              borderRadius="50px"
              bgcolor={theme.palette.primary.main}
            >
              <CalendarMonthRoundedIcon />
              <Typography variant="subtitle2">2025 / 10 / 31</Typography>
            </Stack>

            {/* 세부 정보 */}
            <Box display="flex" flex={1}>
              <Stack
                direction="row"
                minWidth="650px"
                alignItems="center"
                borderRadius="10px"
                border={`2px solid ${theme.palette.primary.main}`}
                p={1.5}
                px={3}
                gap={1}
              >
                {/* 학년 */}
                <Typography variant="body1" fontWeight="bold">
                  고등학교 1학년
                </Typography>

                {/* 과목 */}
                <Typography variant="body1" fontWeight="bold">
                  과목:
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  국어
                </Typography>

                {/* 학습 단원 */}
                <Typography variant="body1" fontWeight="bold">
                  학습 단원:
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  현대 소설의 정의, 특징, 역사를 학습합니다.
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Stack direction="row" flex={1} gap={2}>
            {/* 정답수 원 그래프 */}
            <Stack
              ref={pieContainerRef}
              width="400px"
              height="400px"
              justifyContent="center"
              alignItems="center"
              p={3}
              bgcolor={"#f4f4f4"}
              borderRadius={3}
              position="relative"
            >
              <Typography
                variant="subtitle2"
                alignSelf="flex-start"
                fontWeight={500}
                position="absolute"
                top="16px"
                left="16px"
              >
                총 문제 수 / 정답 수
              </Typography>
              <ResultChart size={chartSize} />
            </Stack>

            {/* 채점 결과 */}
            <Stack borderRadius={3} overflow="hidden" flex={1}>
              {AssessmentData.assessments
                .slice(pageIndex * 6, 6 + pageIndex * 6)
                .map((assessment, index) => (
                  <MarkedItem
                    key={`marked-item-${index}`}
                    width="100%"
                    height="calc(100% / 6)"
                    index={index + 1}
                    question={assessment.title}
                    bgcolor={index % 2 === 0 ? "#D9EBE9" : "#F4F4F4"}
                    isCorrect={userSelect[index] === answer[index]}
                  />
                ))}
            </Stack>
          </Stack>

          {/* 문제 페이지네이션 */}
          <Stack
            direction="row"
            gap={3}
            alignSelf="flex-end"
            pr={1}
            sx={{
              transform: "translateY(-4px)",
            }}
          >
            {/* 이전 페이지 */}
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                p: 1,
                minWidth: 0,
                borderRadius: "50%",
              }}
              onClick={() => setPageIndex(0)}
            >
              <EastRoundedIcon sx={{ transform: "rotate(180deg)" }} />
            </Button>

            {/* 다음 페이지 */}
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                p: 1,
                minWidth: 0,
                borderRadius: "50%",
              }}
              onClick={() => setPageIndex(1)}
            >
              <EastRoundedIcon />
            </Button>
          </Stack>
        </Stack>

        <Divider
          sx={{
            borderWidth: "1px",
            borderColor: "#EEEEEE",
            transform: "scaleX(2)",
          }}
        />

        {/* 분석하기 섹션 */}
        {isAnalyzed ? (
          <AnalyzeResult />
        ) : (
          <Analyze onAnalyze={handleAnalyzeButtonClick} />
        )}
      </Container>
    </Stack>
  );
};

export default Result;
