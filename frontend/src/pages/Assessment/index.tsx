import { Box, Button, Container, Stack, Typography } from "@mui/material";
import AssessmentItem from "./AssessmentItem";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

const Assessment = () => {
  return (
    <Container maxWidth="lg">
      <Stack py={15} gap={7}>
        {/* 헤더 */}
        <Typography variant="h4">내 학습 성적표</Typography>

        <Stack direction="row" justifyContent="space-between">
          <AssessmentItem
            bgcolor="#EFF7F6"
            grade="고등학교 1학년"
            subject="국어"
            createdAt="2025 / 10 / 30"
            content="현대시의 정의, 특징, 역사를 이해하고 기본 분석 능력을 기릅니다."
          />
          <AssessmentItem
            bgcolor="#D8EEEB"
            grade="고등학교 1학년"
            subject="수학"
            createdAt="2025 / 10 / 30"
            content="기본적인 수의 계산과 식의 정리 능력을 기릅니다."
          />
          <AssessmentItem
            bgcolor="#BCE6E0"
            grade="고등학교 1학년"
            subject="국어"
            createdAt="2025 / 10 / 31"
            content="현대 소설의 정의, 특징, 역사를 학습합니다."
          />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <AssessmentItem
            bgcolor="#EFF7F6"
            grade="고등학교 1학년"
            subject="국어"
            createdAt="2025 / 10 / 31"
            content="현대시의 심화된 이론과 역사를 학습합니다. "
          />
          <AssessmentItem
            bgcolor="#D8EEEB"
            grade="고등학교 1학년"
            subject="국어"
            createdAt="2025 / 10 / 31"
            content="감정 표현의 다양성에 대해 학습하고 실력을 키웁니다."
          />
          <AssessmentItem
            bgcolor="#BCE6E0"
            grade="고등학교 1학년"
            subject="국어"
            createdAt="2025 / 10 / 31"
            content="명사의 정의와 종류를 학습합니다."
          />
        </Stack>

        {/* 성취도 평가 생성 버튼 */}
        <Box alignSelf="flex-end">
          <Button
            variant="contained"
            color="primary"
            endIcon={
              <Stack p={0.35} borderRadius="50%" border={"1px solid white"}>
                <EastRoundedIcon
                  sx={{
                    fontSize: "0.6em",
                  }}
                />
              </Stack>
            }
            sx={{
              py: 2,
            }}
          >
            <Typography variant="body1">내 결과 확인하기</Typography>
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Assessment;
