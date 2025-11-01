import {
  Box,
  Container,
  Stack,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import BackgroundEffect from "./BackgroundEffect";
import { useAtomValue } from "jotai";
import { userAtom } from "../../states/auth";

const AnalyzeResult = () => {
  const theme = useTheme();

  const user = useAtomValue(userAtom);

  return (
    <Stack py={15} alignItems="center" gap={3} position="relative">
      {/* 헤더 */}
      <Typography variant="h4">{user?.user_id}님의 공부 습관은...</Typography>

      <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
        일주일동안의 {user?.user_id}님의 공부 습관을 분석했습니다.
      </Typography>

      <Container maxWidth="md">
        {/* AI 학습 분석 */}
        <Zoom in={true} style={{ transitionDelay: "0.5s" }}>
          <Stack gap={2} width="100%" alignItems="flex-start" mt={2}>
            {/* 섹션 헤더 */}
            <Box
              bgcolor={theme.palette.secondary.main}
              p={1.5}
              px={2.5}
              borderRadius="50px"
            >
              <Typography variant="body1" color="white" fontWeight={500}>
                AI Study Insight
              </Typography>
            </Box>

            <Stack
              width="100%"
              borderRadius={3}
              border={`2px solid ${theme.palette.primary.main}`}
              p={4}
              px={5}
              gap={0.5}
              bgcolor="white"
            >
              {[
                {
                  label: "뛰어난 점",
                  content: (
                    <span>
                      한국 현대시사의 기본 이해
                      <br />
                      시인별 특징 구분
                      <br />
                      한국 현대문학 역사 파악
                    </span>
                  ),
                },
                {
                  label: "보완할 점",
                  content: (
                    <span>
                      시적 표현의 세부 해석
                      <br />
                      상징과 은유의 구분
                      <br />
                      작품의 주제 파악
                    </span>
                  ),
                },
              ].map((item) => (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    position="relative"
                    sx={{
                      "&:before": {
                        content: '""',
                        position: "absolute",
                        width: "6px",
                        height: "6px",
                        top: "50%",
                        left: "-12px",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "50%",
                        bgcolor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {item.label} :
                  </Typography>
                  <Typography variant="body1">{item.content}</Typography>
                </>
              ))}
            </Stack>
          </Stack>
        </Zoom>

        {/* 개선 포인트 */}
        <Zoom in={true} style={{ transitionDelay: "0.75s" }}>
          <Stack gap={2} width="100%" alignItems="flex-start" mt={3}>
            {/* 섹션 헤더 */}
            <Box
              bgcolor={theme.palette.secondary.main}
              p={1.5}
              px={2.5}
              borderRadius="50px"
            >
              <Typography variant="body1" color="white" fontWeight={500}>
                개선 포인트
              </Typography>
            </Box>

            <Stack
              width="100%"
              borderRadius={3}
              border={`2px solid ${theme.palette.primary.main}`}
              p={4}
              px={5}
              gap={0.5}
              bgcolor="white"
            >
              <Typography variant="body1">
                기본 문학 개념 정리 및 반복 학습
                <br />
                유명 현대시 작품 정독 및 깊이 있는 분석
                <br />
                표현 기법 분류 및 사례별 정리
              </Typography>
            </Stack>
          </Stack>
        </Zoom>
      </Container>

      {/* 아이콘 */}
      <BackgroundEffect />
    </Stack>
  );
};

export default AnalyzeResult;
