import {
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import GreyTextField from "../components/GreyTextField";
import { useCallback, useState } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import z from "zod";
import { signup } from "../services/auth";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";

const SignupSchema = z
  .object({
    id: z.string().min(1, "아이디를 입력해주세요."),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    passwordConfirm: z.string(),
    email: z.email("올바른 이메일 주소를 입력해주세요."),
  })
  .superRefine(({ password, passwordConfirm }, ctx) => {
    if (password !== passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "비밀번호가 일치하지 않습니다.",
        path: ["passwordConfirm"],
      });
    }
  });
type SignupFormData = z.infer<typeof SignupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [values, setValues] = useState<SignupFormData>({
    id: "",
    password: "",
    passwordConfirm: "",
    email: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupFormData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isTosAgreed, setIsTosAgreed] = useState(false);

  // 각 필드 블러 시 입력값 검증
  const handleBlur = useCallback(
    (field: keyof SignupFormData) => {
      // 전체 폼을 검증하여 superRefine도 실행
      const result = SignupSchema.safeParse(values);

      if (!result.success) {
        // 현재 필드와 관련된 에러만 찾기
        const fieldError = result.error.issues.find(
          (issue) => issue.path[0] === field
        );

        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        } else {
          setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
      } else {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [values]
  );

  // 회원가입 버튼 클릭
  const handleSubmitButtonClick = useCallback(async () => {
    // 폼 유효성 검증
    const result = SignupSchema.safeParse(values);
    if (!result.success) {
      // 에러 메시지 추출
      const fieldErrors: Partial<Record<keyof SignupFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof SignupFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // 회원가입 API 호출
    try {
      await signup({
        id: values.id,
        password: values.password,
        email: values.email,
      });

      enqueueSnackbar("회원가입이 완료되었습니다!", { variant: "success" });
      navigate("/login");
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          const code = err.response.data.code;
          console.log(code);

          if (code === "DUPLICATE_ID") {
            setErrors((prev) => ({
              ...prev,
              id: "이미 존재하는 아이디입니다.",
            }));
          } else if (code === "DUPLICATE_EMAIL") {
            setErrors((prev) => ({
              ...prev,
              email: "이미 존재하는 이메일입니다.",
            }));
          }
        }
      }
      enqueueSnackbar("회원가입에 실패했습니다.", { variant: "error" });
    }
  }, [enqueueSnackbar, navigate, values]);

  return (
    <Container maxWidth="md">
      <Stack py={15} gap={9}>
        {/* 헤더 */}
        <Stack gap={0.5}>
          <Typography variant="h5">
            '스터디메이트'에 오신 걸 환영합니다!
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            당신의 공부 여정을 함께할 든든한 친구가 되어드릴게요.
          </Typography>
          <Divider
            sx={{
              mt: 2,
            }}
          />
        </Stack>

        {/* 회원가입 폼 */}
        <Stack
          gap={{
            xs: 4,
            md: 9,
          }}
        >
          {/* 아이디 */}
          <GreyTextField
            label="아이디"
            id="id"
            required
            value={values.id}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, id: e.target.value }))
            }
            error={!!errors.id}
            helperText={errors.id}
            onBlur={() => handleBlur("id")}
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
            error={!!errors.password}
            helperText={errors.password}
            onBlur={() => handleBlur("password")}
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

          {/* 비밀번호 확인 */}
          <GreyTextField
            label="비밀번호 확인"
            id="password-confirm"
            type={showPasswordConfirm ? "text" : "password"}
            required
            value={values.passwordConfirm}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                passwordConfirm: e.target.value,
              }))
            }
            error={!!errors.passwordConfirm}
            helperText={errors.passwordConfirm}
            onBlur={() => handleBlur("passwordConfirm")}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setShowPasswordConfirm((prev) => !prev)}
                >
                  {showPasswordConfirm ? (
                    <VisibilityRoundedIcon />
                  ) : (
                    <VisibilityOffRoundedIcon />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            gap={2}
          >
            <Stack flex={1}>
              {/* 이메일 */}
              <GreyTextField
                label="이메일"
                id="email"
                type="email"
                fullWidth
                required
                value={values.email}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, email: e.target.value }))
                }
                error={!!errors.email}
                helperText={errors.email}
                onBlur={() => handleBlur("email")}
              />
            </Stack>

            {/* 인증번호 받기 버튼 */}
            {/* TODO: 버튼 로직 추가 구현 */}
            <Button
              variant="contained"
              color="secondary"
              sx={{
                ml: 3,
                alignSelf: {
                  xs: "flex-end",
                },
              }}
            >
              인증번호 받기
            </Button>
          </Stack>
        </Stack>

        {/* 이용약관 */}
        <Stack mt={7} gap={3}>
          {/* 이용약관 헤더 */}
          <Stack>
            <Typography variant="h6">이용약관</Typography>
            <Divider />
          </Stack>

          {/* 전체 동의 */}
          <Stack gap={1.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isTosAgreed}
                  onChange={(e) => setIsTosAgreed(e.target.checked)}
                />
              }
              label="전체 동의하기"
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
            <Divider
              sx={{
                borderTop: "none",
                borderWidth: "1px",
                borderColor: "secondary.light",
              }}
            />
          </Stack>

          {/* 개인정보 수집 및 이용 동의 */}
          <Stack gap={1.5}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={1}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isTosAgreed}
                    onChange={(e) => setIsTosAgreed(e.target.checked)}
                  />
                }
                label="[필수] 개인정보 수집 및 이용약관 동의"
                labelPlacement="end"
                slotProps={{
                  typography: {
                    fontWeight: 500,
                  },
                }}
              />

              {/* 펼치기 버튼 */}
              <IconButton size="small">
                <AddRoundedIcon sx={{ color: "secondary.light" }} />
              </IconButton>
            </Stack>
            <Divider
              sx={{
                borderTop: "none",
                borderWidth: "1px",
                borderColor: "secondary.light",
              }}
            />
          </Stack>

          {/* 회원가입 버튼 */}
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
            onClick={handleSubmitButtonClick}
            disabled={!SignupSchema.safeParse(values).success || !isTosAgreed}
          >
            <Typography variant="body1" fontWeight={500}>
              가입하기
            </Typography>
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Signup;
