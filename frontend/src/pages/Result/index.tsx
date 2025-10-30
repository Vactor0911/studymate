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

const Result = () => {
  const theme = useTheme();

  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const pieContainerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState(200);

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
              <Typography variant="subtitle2">2025 / 10 / 26</Typography>
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
                  고등학교 3학년
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
                  2단원 | 2-1 어떻게 읽을까 삶을 바꾼 만남
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
            >
              <Typography
                variant="subtitle2"
                alignSelf="flex-start"
                fontWeight={500}
              >
                총 문제 수 / 정답 수
              </Typography>
              <ResultChart size={chartSize} />
            </Stack>

            {/* 채점 결과 */}
            <Stack borderRadius={3} overflow="hidden" bgcolor="green" flex={1}>
              {[
                {
                  index: 1,
                  question:
                    "글쓴이가 '삶을 바꾼 만남'이라고 표현한 이유로 가장 적절한 것은?",
                  isCorrect: true,
                },
                {
                  index: 2,
                  question:
                    "글쓴이가 '삶을 바꾼 만남'이라고 표현한 이유로 가장 적절한 것은?",
                  isCorrect: true,
                },
                {
                  index: 3,
                  question:
                    "글쓴이가 '삶을 바꾼 만남'이라고 표현한 이유로 가장 적절한 것은?",
                  isCorrect: true,
                },
                {
                  index: 4,
                  question:
                    "글쓴이가 '삶을 바꾼 만남'이라고 표현한 이유로 가장 적절한 것은?",
                  isCorrect: true,
                },
                {
                  index: 5,
                  question:
                    "글쓴이가 '삶을 바꾼 만남'이라고 표현한 이유로 가장 적절한 것은?",
                  isCorrect: true,
                },
                {
                  index: 6,
                  question:
                    "글쓴이가 '삶을 바꾼 만남'이라고 표현한 이유로 가장 적절한 것은?",
                  isCorrect: true,
                },
              ].map((item, index) => (
                <MarkedItem
                  width="100%"
                  height="calc(100% / 6)"
                  index={index + 1}
                  question={item.question}
                  bgcolor={index % 2 === 0 ? "#D9EBE9" : "#F4F4F4"}
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
