import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ProgressBar from "./ProgressBar";
import AnswerSelect from "./AnswerSelect";
import { useState } from "react";
import { useAtomValue } from "jotai";
import { headerRefAtom } from "../../states";

const AssessmentDetail = () => {
  const theme = useTheme();

  const headerRef = useAtomValue(headerRefAtom);
  const [selections] = useState([
    { content: "선택지 1" },
    { content: "선택지 2" },
    { content: "선택지 3" },
    { content: "선택지 4" },
    { content: "선택지 5" },
  ]);

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
          <ProgressBar total={10} current={3} />
          
          <Container maxWidth="md">
            <Stack gap={5} mt={5}>
              {/* 문제 분류 */}
              <Typography variant="subtitle1" color="text.secondary">
                [증가, 감소 구간]
              </Typography>

              {/* 문제 제목 */}
              <Typography variant="h4">국어 문제 지문 어쩌고 저쩌고</Typography>

              {/* 선택지 */}
              <Stack gap={3} alignItems="flex-start">
                {selections.map((selection, index) => (
                  <AnswerSelect
                    key={`answer-select-${index}`}
                    index={index + 1}
                    content={selection.content}
                  />
                ))}
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
              >
                <Typography variant="body1">건너뛰기</Typography>
              </Button>
            </Stack>

            {/* 다음 버튼 */}
            <Button
              variant="contained"
              sx={{
                width: "100px",
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">다음</Typography>
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default AssessmentDetail;
