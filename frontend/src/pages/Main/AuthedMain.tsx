import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useAtomValue } from "jotai";
import { userAtom } from "../../states/auth";
import AuthProtected from "../../components/AuthProtected";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import { headerRefAtom } from "../../states";
import BarHistory from "./BarHistory";

const AuthedMain = () => {
  const theme = useTheme();

  const user = useAtomValue(userAtom);
  const headerRef = useAtomValue(headerRefAtom);

  return (
    <AuthProtected>
      <Box overflow="hidden">
        <Container maxWidth="xl">
          <Stack
            height={`calc(100vh - ${headerRef?.current?.clientHeight}px)`}
            py={10}
            gap={5}
          >
            {/* 헤더 */}
            <Stack direction="row" alignItems="center" gap={1}>
              {/* 인사 문구 */}
              <Typography variant="h4">
                안녕하세요! {user?.user_id}님
              </Typography>

              {/* 장식 */}
              <Box
                width={8}
                height={8}
                borderRadius="50%"
                bgcolor={theme.palette.secondary.main}
              />
              <Box
                width={24}
                height={2}
                bgcolor={theme.palette.secondary.main}
              />

              {/* 안내 문구 */}
              <Box
                bgcolor={theme.palette.secondary.main}
                p={2}
                borderRadius="50px"
              >
                <Typography variant="body1" color="white" fontWeight={500}>
                  지난 5일, 이렇게 공부했어요
                </Typography>
              </Box>
            </Stack>

            <Divider
              sx={{
                borderColor: "#EEEEEE",
                borderWidth: "1px",
                transform: "scaleX(2)",
              }}
            />

            <Stack direction="row" flex={1} gap={10}>
              {/* 막대 */}
              <Box flex={1}>
                <BarHistory />
              </Box>

              {/* 우측 컨테이너 */}
              <Stack height="100%" justifyContent="space-between">
                {/* 상단 안내 컨테이너 */}
                <Stack gap={1} mt={3}>
                  {/* 안내 문구 */}
                  <Typography variant="subtitle1" fontWeight="bold">
                    <span
                      css={{
                        color: theme.palette.primary.main,
                      }}
                    >
                      Studymate
                    </span>{" "}
                    가 분석한
                    <br />
                    하루하루의 학습 리듬을 확인해보세요.
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    막대를 클릭하면 해당 일차의 공부 내용 표시
                  </Typography>

                  {/* 점선 */}
                  <Box
                    mt={1.5}
                    width="100%"
                    height="2px"
                    borderRadius="50px"
                    sx={{
                      backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main} 50%, transparent 50%)`,
                      backgroundSize: "10px 2px",
                      backgroundRepeat: "repeat-x",
                      backgroundPosition: "center",
                      borderWidth: "1px",
                    }}
                  />
                </Stack>

                {/* 내 결과 확인하기 버튼 */}
                <Box alignSelf="center">
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={
                      <Stack
                        p={0.35}
                        borderRadius="50%"
                        border={"1px solid white"}
                      >
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
            </Stack>
          </Stack>
        </Container>
      </Box>
    </AuthProtected>
  );
};

export default AuthedMain;
