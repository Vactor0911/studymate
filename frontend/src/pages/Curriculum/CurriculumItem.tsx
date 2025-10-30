import { Box, ButtonBase, Stack, Typography, useTheme } from "@mui/material";

interface CurriculumItemProps {
  createdAt: string;
  subject: string;
  grade: string;
  detail: string;
  color: string;
}

const CurriculumItem = (props: CurriculumItemProps) => {
  const { createdAt, subject, grade, detail, color } = props;

  const theme = useTheme();

  return (
    <ButtonBase
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        width="100%"
        height="180px"
        bgcolor={color}
        border="2px solid #3FD4C7"
        borderRadius={3}
        alignItems="center"
        gap={5}
        px={5}
      >
        {/* 생성 날짜 */}
        <Box
          border={`1px solid ${theme.palette.primary.main}`}
          bgcolor={"white"}
          p={1.5}
          px={2}
          borderRadius="50px"
        >
          <Typography variant="h6">{createdAt}</Typography>
        </Box>

        {/* 과목 */}
        <Typography variant="h6">
          과목 :{" "}
          <span
            css={{
              fontWeight: 500,
              color: theme.palette.text.secondary,
              marginLeft: "8px",
            }}
          >
            {subject}
          </span>
        </Typography>

        {/* 학년 */}
        <Typography variant="h6">
          학년 :{" "}
          <span
            css={{
              fontWeight: 500,
              color: theme.palette.text.secondary,
              marginLeft: "8px",
            }}
          >
            {grade}
          </span>
        </Typography>

        {/* 상세정보 */}
        <Typography variant="h6">
          학습 내용 :{" "}
          <span
            css={{
              fontWeight: 500,
              color: theme.palette.text.secondary,
              marginLeft: "8px",
            }}
          >
            {detail}
          </span>
        </Typography>
      </Stack>
    </ButtonBase>
  );
};

export default CurriculumItem;
