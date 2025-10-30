import {
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import GreyTextField from "../components/GreyTextField";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import z from "zod";
import { login } from "../services/auth";
import { useSnackbar } from "notistack";
import { useAtom } from "jotai";
import { savedIdAtom } from "../states/auth";

const LoginSchema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});
type LoginFormData = z.infer<typeof LoginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [values, setValues] = useState<LoginFormData>({
    id: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saveId, setSaveId] = useState(false);
  const [savedId, setSavedId] = useAtom(savedIdAtom);

  useEffect(() => {
    if (savedId) {
      setValues((prev) => ({ ...prev, id: savedId }));
      setSaveId(true);
    }
  }, [savedId]);

  const handleLoginButtonClick = useCallback(async () => {
    // 폼 유효성 검사
    const parsed = LoginSchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    // 로그인 API 호출
    try {
      await login({
        id: values.id,
        password: values.password,
      });

      // 아이디 저장 처리
      if (saveId) {
        setSavedId(values.id);
      } else {
        setSavedId(null);
      }

      // 로그인 성공 시 메인 페이지로 이동
      enqueueSnackbar("로그인에 성공했습니다!", { variant: "success" });
      navigate("/");
    } catch {
      setValues((prev) => ({ ...prev, password: "" }));
      enqueueSnackbar("로그인에 실패했습니다.", { variant: "error" });
    }
  }, [enqueueSnackbar, navigate, saveId, setSavedId, values]);

  return (
    <Container maxWidth="md">
      <Stack
        py={{
          xs: 15,
          md: 20,
        }}
        gap={3}
      >
        {/* 헤더 */}
        <Typography variant="h4" fontWeight={500}>
          로그인
        </Typography>

        {/* 로그인 폼 */}
        <Stack
          gap={{
            xs: 4,
            md: 7,
          }}
          mt={5}
        >
          {/* 아이디 */}
          <GreyTextField
            label="아이디"
            id="id"
            required
            value={values.id}
            onChange={(e) => {
              setValues((prev) => ({ ...prev, id: e.target.value }));
            }}
          />

          {/* 비밀번호 */}
          <GreyTextField
            label="비밀번호"
            id="password"
            type={showPassword ? "text" : "password"}
            required
            value={values.password}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, password: e.target.value }))
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <VisibilityRoundedIcon />
                  ) : (
                    <VisibilityOffRoundedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
        </Stack>

        {/* 아이디 저장 체크박스 */}
        <FormControlLabel
          control={
            <Checkbox
              checked={saveId}
              onChange={(e) => setSaveId(e.target.checked)}
            />
          }
          label="아이디 저장"
          labelPlacement="end"
          sx={{
            alignSelf: "flex-start",
          }}
          slotProps={{
            typography: {
              fontWeight: 500,
            },
          }}
        />

        {/* 하단 컨테이너 */}
        <Stack gap={3}>
          {/* 로그인 버튼 */}
          <Button
            variant="contained"
            color="secondary"
            sx={{
              mt: 3,
              py: 3,
              border: "2px solid transparent",
              "&:hover": {
                background: "white",
                color: theme.palette.text.primary,
                border: `2px solid ${theme.palette.secondary.main}`,
              }
            }}
            disabled={!LoginSchema.safeParse(values).success}
            onClick={handleLoginButtonClick}
          >
            <Typography variant="body1" fontWeight={500}>
              로그인
            </Typography>
          </Button>

          {/* 링크 컨테이너 */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            {/* 아이디 / 비밀번호 찾기 */}
            <Link to="/" css={{ textDecoration: "none" }}>
              <Typography variant="body1" color="#A0A0A0">
                아이디 / 비밀번호 찾기
              </Typography>
            </Link>

            {/* 회원가입 */}
            <Link
              to="/signup"
              css={{ textDecoration: "none" }}
              onClick={() => {
                window.scrollTo({ top: 100, behavior: "smooth" });
              }}
            >
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  "&:after": {
                    content: '""',
                    display: "inline-block",
                    width: "100%",
                    height: "1px",
                    bgcolor: "secondary.light",
                  },
                }}
              >
                아직 회원이 아니신가요?
              </Typography>
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Login;
