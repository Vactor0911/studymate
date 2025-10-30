import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";
import CurriculumItem from "./CurriculumItem";

type CurriculumType = {
  createdAt: string;
  subject: string;
  grade: string;
  detail: string;
};

const CurriculumData = [
  {
    createdAt: "2025 / 10 / 30",
    subject: "국어",
    grade: "고등학교 1학년",
    detail: "현대시의 정의, 특징, 역사를 이해하고 기본 분석 능력을 기른다.",
  },
  {
    createdAt: "2025 / 10 / 31",
    subject: "수학",
    grade: "고등학교 1학년",
    detail: "기본적인 수의 계산과 식의 정리 능력을 기른다.",
  },
  {
    createdAt: "2025 / 10 / 31",
    subject: "수학",
    grade: "중학교 3학년",
    detail: "기본 연산과 방정식을 학습합니다",
  },
] as CurriculumType[];

const Curriculum = () => {
  const [grade, setGrade] = useState(1);
  const [subject, setSubject] = useState("과목");
  const [duration, setDuration] = useState("기간");
  const [curriculums, ] = useState(CurriculumData);

  const getColor = useCallback((index: number) => {
    switch (index) {
      case 0:
        return "#EFF7F6";
      case 1:
        return "#D8EEEB";
      default:
        return "#BCE6E0";
    }
  }, []);

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
            p={1.5}
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
          {curriculums.map((item, index) => (
            <CurriculumItem
              key={`curriculum-item-${index}`}
              createdAt={item.createdAt}
              grade={item.grade}
              subject={item.subject}
              detail={item.detail}
              color={getColor(index)}
            />
          ))}
        </Stack>

        {/* 커리큘럼 생성 버튼 */}
        <Box alignSelf="flex-end">
          <Button variant="contained" color="primary">
            <Typography variant="body1" fontWeight={500}>
              커리큘럼 생성하기
            </Typography>
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default Curriculum;
