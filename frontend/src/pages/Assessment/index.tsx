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
          <AssessmentItem bgcolor="#EFF7F6" />
          <AssessmentItem bgcolor="#D8EEEB" />
          <AssessmentItem bgcolor="#BCE6E0" />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <AssessmentItem bgcolor="#EFF7F6" />
          <AssessmentItem bgcolor="#D8EEEB" />
          <AssessmentItem bgcolor="#BCE6E0" />
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
