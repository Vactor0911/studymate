import { Button, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router";

interface AssessmentItemProps {
  bgcolor: string;
  subject: string;
  createdAt: string;
  grade: string;
  content: string;
}

const AssessmentItem = (props: AssessmentItemProps) => {
  const { bgcolor, subject, createdAt, grade, content } = props;

  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Stack width="32%" gap={1}>
      <Stack
        gap={3}
        borderRadius={4}
        p={2}
        border={`2px solid ${theme.palette.primary.main}`}
        bgcolor={bgcolor}
        height="stretch"
      >
        {/* 헤더 */}
        <Stack direction="row" width="100%" justifyContent="space-between">
          {/* 과목 */}
          <Typography variant="h6">
            과목 :{" "}
            <span
              css={{
                fontWeight: 500,
              }}
            >
              {subject}
            </span>
          </Typography>

          {/* 생성 날짜 */}
          <Typography variant="body2">{createdAt}</Typography>
        </Stack>

        <Stack
          gap={1}
          borderRadius={2}
          px={1}
          py={1.5}
          border={`2px solid ${theme.palette.secondary.main}`}
          bgcolor={"white"}
        >
          {/* 학년 */}
          <Typography variant="subtitle2">
            학년 :{" "}
            <span
              css={{
                color: theme.palette.text.secondary,
              }}
            >
              {grade}
            </span>
          </Typography>

          {/* 학습단원 */}
          <Typography variant="subtitle2">
            학습단원 :{" "}
            <span
              css={{
                color: theme.palette.text.secondary,
              }}
            >
              {content}
            </span>
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        gap={1}
      >
        {/* 결과 보기 버튼 */}
        <Button
          variant="outlined"
          sx={{
            p: 0.5,
            px: 1.5,
            borderRadius: 1,
            "&:hover": {
              background: theme.palette.primary.main,
              color: "white",
            },
          }}
          onClick={() =>
            navigate("result/c770fc8a-df14-4989-9788-be1fc333dfa9")
          }
        >
          결과 보기
        </Button>

        {/* 성적표 발급 버튼 */}
        <Button
          variant="outlined"
          sx={{
            p: 0.5,
            px: 1.5,
            borderRadius: 1,
            "&:hover": {
              background: theme.palette.primary.main,
              color: "white",
            },
          }}
          onClick={() =>
            navigate("/result/2bcb77f4-84be-4776-970c-e3132bbd249e")
          }
        >
          성적표 발급
        </Button>
      </Stack>
    </Stack>
  );
};

export default AssessmentItem;
