import {
  Box,
  Container,
  Stack,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import BackgroundEffect from "./BackgroundEffect";

const AnalyzeResult = () => {
  const theme = useTheme();

  return (
    <Stack py={15} alignItems="center" gap={3} position="relative">
      {/* 헤더 */}
      <Typography variant="h4">{"홍길동"}님의 공부 습관은...</Typography>

      <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
        일주일동안의 {"홍길동"}님의 공부 습관을 분석했습니다.
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
                  label: "장점",
                  content:
                    "문학에선 감상 포인트를 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구",
                },
                {
                  label: "단점",
                  content:
                    "문학에선 감상 포인트를 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구",
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
              {[
                {
                  label: "장점",
                  content:
                    "문학에선 감상 포인트를 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구",
                },
                {
                  label: "단점",
                  content:
                    "문학에선 감상 포인트를 어쩌구 저쩌구 어쩌구 저쩌구 어쩌구 저쩌구",
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
      </Container>

      {/* 아이콘 */}
      <BackgroundEffect />
    </Stack>
  );
};

export default AnalyzeResult;
