import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import LogoIcon from "/logo.svg";
import { useLocation, useNavigate } from "react-router";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import PersonIcon from "@mui/icons-material/Person";
import { useCallback, useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "../states/auth";
import ProfileAvatarButton from "./ProfileAvatarButton";
import { logout } from "../services/auth";
import { useSnackbar } from "notistack";
import { headerRefAtom } from "../states";
import { theme } from "../utils/theme";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  const user = useAtomValue(userAtom);
  const headerRef = useRef(null);
  const setHeaderRef = useSetAtom(headerRefAtom);

  // 헤더 Ref 등록
  useEffect(() => {
    if (headerRef.current) {
      setHeaderRef(headerRef);
    }
  }, [setHeaderRef]);

  // 프로필 버튼 클릭
  const handleProfileButtonClick = useCallback(async () => {
    if (user) {
      // 회원가입이 된 경우
      // TODO: 추후 기능 추가

      // 임시 로그아웃 기능
      await logout();
      enqueueSnackbar("로그아웃 되었습니다.", { variant: "success" });
    } else {
      // 회원가입이 안된 경우 로그인 페이지로 이동
      navigate("/login");
    }
  }, [enqueueSnackbar, navigate, user]);

  return (
    <AppBar
      ref={headerRef}
      position="static"
      color="inherit"
      sx={{
        boxShadow: "0 0 16px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            height: {
              xs: "70px",
              md: "120px",
            },
          }}
        >
          {/* 모바일용 메뉴 버튼 */}
          <Box
            display={{
              xs: "flex",
              md: "none",
            }}
            flex={1}
          >
            {/* 메뉴 버튼 */}
            <IconButton size="small">
              <MenuRoundedIcon fontSize="large" color="secondary" />
            </IconButton>
          </Box>

          {/* 로고 */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            sx={{
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <Typography variant="h5">StudyMate</Typography>
            <Box component="img" src={LogoIcon} />
          </Stack>

          {/* 데스크탑용 메뉴 */}
          <Stack
            display={{
              xs: "none",
              md: "flex",
            }}
            direction="row"
            alignItems="center"
            flex={1}
            pl={{
              xs: 0,
              sm: 5,
            }}
          >
            {/* 네비게이션 메뉴 */}
            <Stack
              display={{
                xs: "none",
                md: "flex",
              }}
              direction="row"
              alignItems="center"
              borderRadius="50px"
              bgcolor="#F6F6F6"
              padding={1.5}
              px={3}
              gap={1}
            >
              {[
                { label: "커리큘럼", path: "/curriculum" },
                { label: "성취도 평가", path: "/assessment" },
                { label: "학습 현황", path: "/course" },
              ].map((item) => (
                <Button
                  key={item.path}
                  variant="contained"
                  color={"transparent"}
                  onClick={() => navigate(item.path)}
                  sx={{
                    background:
                      location.pathname === item.path
                        ? theme.palette.primary.main
                        : "transparent",
                    color:
                      location.pathname === item.path ? "white" : "inherit",
                    transition: `box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
                      color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`,
                    "&:hover": {
                      color: theme.palette.secondary.main,
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    {item.label}
                  </Typography>
                </Button>
              ))}
            </Stack>

            {/* 회원 버튼 컨테이너 */}
            <Stack
              display={{
                xs: "none",
                md: "flex",
              }}
              direction="row"
              alignItems="center"
              flex={1}
              justifyContent="flex-end"
              gap={2}
            >
              {user ? (
                <ProfileAvatarButton
                  sx={{
                    width: "50px",
                    height: "50px",
                  }}
                  onClick={handleProfileButtonClick}
                />
              ) : (
                <>
                  {/* 로그인 버튼 */}
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/login")}
                    sx={{
                      bgcolor:
                        location.pathname === "/login"
                          ? theme.palette.primary.main
                          : "inherit",
                      color:
                        location.pathname === "/login" ? "white" : "inherit",
                      "&:hover": {
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                      },
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      로그인
                    </Typography>
                  </Button>

                  {/* 회원가입 버튼 */}
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/signup")}
                    sx={{
                      bgcolor:
                        location.pathname === "/signup"
                          ? theme.palette.primary.main
                          : "inherit",
                      color:
                        location.pathname === "/signup" ? "white" : "inherit",
                      "&:hover": {
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                      },
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      회원가입
                    </Typography>
                  </Button>
                </>
              )}
            </Stack>
          </Stack>

          {/* 모바일용 사용자 버튼 */}
          <Box
            display={{
              xs: "flex",
              md: "none",
            }}
            justifyContent="flex-end"
            flex={1}
          >
            {user ? (
              <ProfileAvatarButton
                sx={{
                  width: "50px",
                  height: "50px",
                }}
                onClick={handleProfileButtonClick}
              />
            ) : (
              // 사용자 버튼
              <IconButton
                size="small"
                color="primary"
                onClick={handleProfileButtonClick}
              >
                <PersonIcon fontSize="large" color="primary" />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
