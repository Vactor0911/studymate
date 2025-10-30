import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import AloImage from "../../assets/Alo.png";

interface AnalyzeProps {
  onAnalyze?: () => void;
}

const Analyze = (props: AnalyzeProps) => {
  const { onAnalyze } = props;

  const theme = useTheme();

  return (
    <Stack direction="row" py={20} gap={15} justifyContent="center">
      {/* 로봇 이미지 */}
      <Box component="img" src={AloImage} />

      {/* 우측 컨테이너 */}
      <Stack gap={2} py={7}>
        {/* 헤더 */}
        <Typography variant="h4" fontWeight={500}>
          스터디 패턴을
          <br />
          분석해 드릴게요!
        </Typography>

        {/* 문구 */}
        <Typography variant="body1" color="text.secondary">
          AI가 {"홍길동"}님의 공부 장단점 분석과
          <br />
          과목별 공부 습관을 분석해 드립니다.
        </Typography>

        {/* 분석하기 버튼 */}
        <Stack flex={1} justifyContent="flex-end" alignItems="flex-start">
          <Button
            variant="contained"
            color="secondary"
            sx={{
              borderRadius: 1.5,
              "&:hover": {
                bgcolor: theme.palette.primary.main,
              },
            }}
            onClick={onAnalyze}
          >
            <Typography variant="body1" fontWeight={500} px={2}>
              분석하기
            </Typography>
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Analyze;
