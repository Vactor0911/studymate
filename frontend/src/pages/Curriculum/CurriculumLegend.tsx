import { Box, Paper, Stack, Typography, useTheme } from "@mui/material";

const CurriculumLegend = () => {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        position: "absolute",
        top: 10,
        left: 10,
        padding: 1,
        bgcolor: "#f6f6f6",
        zIndex: 2,
      }}
    >
      <Stack gap={0.5}>
        {/* 학습 단계 */}
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            width="30px"
            height="15px"
            bgcolor={theme.palette.primary.main}
            border="2px solid black"
            borderRadius={1}
          />
          <Typography variant="caption">학습 단계</Typography>
        </Stack>

        {/* 학습 내용 */}
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            width="30px"
            height="15px"
            bgcolor="white"
            border={`2px solid ${theme.palette.primary.main}`}
            borderRadius={1}
          />
          <Typography variant="caption">학습 내용</Typography>
        </Stack>

        {/* 자격증 */}
        <Stack direction="row" gap={1} alignItems="center">
          <Box
            width="30px"
            height="15px"
            bgcolor={theme.palette.secondary.light}
            border="2px solid black"
            borderRadius={1}
          />
          <Typography variant="caption">자격증</Typography>
        </Stack>

        {/* 정규 학습 과정 */}
        <Stack direction="row" gap={1} alignItems="center">
          <Box width="30px" border="2px solid #b1b1b7" borderRadius={1} />
          <Typography variant="caption">정규 과정</Typography>
        </Stack>

        {/* 선택 학습 과정 */}
        <Stack direction="row" gap={1} alignItems="center">
          <Box width="30px" border="2px dashed #b1b1b7" borderRadius={1} />
          <Typography variant="caption">선택 학습 과정</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default CurriculumLegend;
