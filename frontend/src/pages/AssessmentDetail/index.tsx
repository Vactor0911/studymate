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
import { useAtomValue } from "jotai";
import { AssessmentDataAtom, headerRefAtom } from "../../states";
import { useState } from "react";
import { useNavigate } from "react-router";

const AssessmentDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const headerRef = useAtomValue(headerRefAtom);
  const assessmentData = useAtomValue(AssessmentDataAtom);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(-1);

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
          <ProgressBar total={11} current={index + 1} />

          <Container maxWidth="md">
            <Stack gap={5} mt={2}>
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
                {assessmentData.assessments[index].title}
              </Typography>

              {/* 선택지 */}
              <Stack gap={3} alignItems="flex-start">
                {assessmentData.assessments[index].options.map(
                  (option, index) => (
                    <AnswerSelect
                      key={`answer-select-${index}`}
                      index={index + 1}
                      content={option}
                      onClick={() => setSelectedOption(index)}
                      isSelected={selectedOption === index}
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

              {/* 건너뛰기 버튼 */}
              <Button
                variant="outlined"
                color="secondary"
                sx={{
                  width: "100px",
                  borderRadius: 2,
                }}
                onClick={() => {
                  setSelectedOption(-1);
                  setIndex((prev) => prev + 1);
                }}
              >
                <Typography variant="body1">건너뛰기</Typography>
              </Button>
            </Stack>

            {/* 다음 버튼 */}
            {index < assessmentData.assessments.length - 1 && (
              <Button
                variant="contained"
                sx={{
                  width: "100px",
                  borderRadius: 2,
                }}
                disabled={selectedOption === -1}
                onClick={() => {
                  if (selectedOption === -1) {
                    return;
                  }

                  setSelectedOption(-1);
                  setIndex((prev) => prev + 1);
                }}
              >
                <Typography variant="body1">다음</Typography>
              </Button>
            )}

            {/* 제출 */}
            {index === assessmentData.assessments.length - 1 && (
              <Button
                variant="contained"
                sx={{
                  width: "100px",
                  borderRadius: 2,
                }}
                disabled={selectedOption === -1}
                onClick={() => {
                  if (selectedOption === -1) {
                    return;
                  }

                  navigate("/");
                }}
              >
                <Typography variant="body1">제출</Typography>
              </Button>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default AssessmentDetail;
