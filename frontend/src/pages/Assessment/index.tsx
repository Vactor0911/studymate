import {
  Box,
  Button,
  ButtonBase,
  Container,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

const Assessment = () => {
  const [grade, setGrade] = useState(1);
  const [subject, setSubject] = useState("과목");
  const [duration, setDuration] = useState("기간");

  return (
    <Container maxWidth="xl">
      <Stack py={15} gap={2}>
        {/* 필터 컨테이너 */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={2}
        >
          {/* 학년 필터 */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            p={1}
            bgcolor="#F6F6F6"
            borderRadius="50px"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Button
                key={`grade-select-${index}`}
                variant="contained"
                disableElevation={index + 1 !== grade}
                color="transparent"
                sx={{
                  bgcolor: index + 1 === grade ? "white" : "transparent",
                  py: 1,
                }}
                onClick={() => setGrade(index + 1)}
              >
                <Typography variant="body1" fontWeight={500}>
                  {index + 1}학년
                </Typography>
              </Button>
            ))}
          </Stack>

          {/* 과목 및 기간 필터 */}
          <Stack direction="row" alignItems="center" gap={2}>
            {/* 과목 */}
            <Box width="180px">
              <Select
                fullWidth
                value={subject}
                onChange={(event) => setSubject(event.target.value as string)}
              >
                <MenuItem value="과목">과목</MenuItem>
                <MenuItem value="국어">국어</MenuItem>
                <MenuItem value="영어">영어</MenuItem>
                <MenuItem value="수학">수학</MenuItem>
              </Select>
            </Box>

            {/* 기간 */}
            <Box width="180px">
              <Select
                fullWidth
                value={duration}
                onChange={(event) => setDuration(event.target.value as string)}
              >
                <MenuItem value="기간">기간</MenuItem>
                <MenuItem value="2주일">2주일</MenuItem>
                <MenuItem value="1개월">1개월</MenuItem>
                <MenuItem value="2개월">2개월</MenuItem>
              </Select>
            </Box>
          </Stack>
        </Stack>

        {/* 성취도 평가 목록 */}
        <Stack gap={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ButtonBase
              sx={{
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <Box
                key={`assessment-item-${index}`}
                width="100%"
                height="180px"
                bgcolor={index % 2 === 0 ? "#D9EBE9" : "#F4F4F4"}
              />
            </ButtonBase>
          ))}
        </Stack>

        {/* 성취도 평가 생성 버튼 */}
        <Box alignSelf="flex-end">
          <Button variant="contained" color="primary">
            <Typography variant="body1" fontWeight={500}>
              성취도 평가 생성하기
            </Typography>
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Assessment;
