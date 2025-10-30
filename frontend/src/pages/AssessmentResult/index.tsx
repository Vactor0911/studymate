import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ProgressBar from "../../components/ProgressBar";
import AnswerSelect from "./AnswerSelect";
import { useState } from "react";
import { useAtomValue } from "jotai";
import {
  AssessmentDataAtom,
  headerRefAtom,
  answerAtom,
  userSelectAtom,
} from "../../states";
import { useNavigate } from "react-router";

const AssessmentResult = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const headerRef = useAtomValue(headerRefAtom);
  const assessmentData = useAtomValue(AssessmentDataAtom);
  const [idx, setIdx] = useState(0);
  const userSelect = useAtomValue(userSelectAtom);
  const isAnswer = useAtomValue(answerAtom);

  return (
    <Box
      sx={{
        overflowX: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          height={`calc(100vh - ${headerRef?.current?.clientHeight}px)`}
          py={7}
          pb={10}
          flex={1}
          gap={3}
        >
          {/* 진행도 바 */}
          <ProgressBar total={11} current={idx + 1} />

          <Container maxWidth="md">
            <Stack gap={5} mt={5}>
              {/* 문제 지문 */}
              <Stack>
                <Typography variant="subtitle1" color="text.secondary">
                  [지문]
                </Typography>

                <Typography variant="subtitle1">
                  {assessmentData.content}
                </Typography>
              </Stack>

              {/* 문제 제목 */}
              <Typography variant="h4">
                {assessmentData.assessments[idx].title}
              </Typography>

              {/* 선택지 */}
              <Stack gap={3} alignItems="flex-start">
                {assessmentData.assessments[idx].options.map(
                  (option, index) => (
                    <AnswerSelect
                      key={`answer-select-${index}`}
                      index={index + 1}
                      content={option}
                      isUserSelect={userSelect[idx] === index}
                      isAnswer={isAnswer[idx] === index}
                    />
                  )
                )}
              </Stack>
            </Stack>
          </Container>

          {/* 구분선 */}
          <Divider
            sx={{
              mt: "auto",
              borderWidth: "1px",
              borderColor: theme.palette.secondary.light,
              transform: "scaleX(2)",
            }}
          />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" gap={2}>
              {/* 나가기 버튼 */}
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  width: "100px",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">나가기</Typography>
              </Button>
            </Stack>

            {/* 다음 버튼 */}
            {idx < assessmentData.assessments.length - 1 && (
              <Button
                variant="contained"
                sx={{
                  width: "100px",
                  borderRadius: 2,
                }}
                onClick={() => {
                  setIdx((prev) => prev + 1);
                }}
              >
                <Typography variant="body1">다음</Typography>
              </Button>
            )}

            {/* 종료 */}
            {idx === assessmentData.assessments.length - 1 && (
              <Button
                variant="contained"
                sx={{
                  width: "100px",
                  borderRadius: 2,
                }}
                onClick={() => {
                  navigate("/");
                }}
              >
                <Typography variant="body1">종료</Typography>
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default AssessmentResult;
