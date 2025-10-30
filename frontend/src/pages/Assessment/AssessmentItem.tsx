import { Button, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router";

interface AssessmentItemProps {
  bgcolor: string;
}

const AssessmentItem = (props: AssessmentItemProps) => {
  const { bgcolor } = props;

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
              수학
            </span>
          </Typography>

          {/* 생성 날짜 */}
          <Typography variant="body2">2025 / 10 / 31</Typography>
        </Stack>

        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          gap={2}
          borderRadius={2}
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
              2학년
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
              수학II [ 미분의 활용 ]
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
        <Button
          variant="outlined"
          sx={{
            p: 0.5,
            px: 1.5,
            borderRadius: 1,
          }}
          onClick={() =>
            navigate("result/c770fc8a-df14-4989-9788-be1fc333dfa9")
          }
        >
          결과 보기
        </Button>
        <Button
          variant="outlined"
          sx={{
            p: 0.5,
            px: 1.5,
            borderRadius: 1,
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
