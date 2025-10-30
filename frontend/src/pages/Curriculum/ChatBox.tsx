import {
  Avatar,
  Box,
  keyframes,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { useAtomValue } from "jotai";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import FaceRoundedIcon from "@mui/icons-material/FaceRounded";
import { useMemo } from "react";
import CircleIcon from "@mui/icons-material/Circle";

export interface Chat {
  isBot: boolean; // 챗봇인지 여부
  content: string; // 메시지 내용
  date: string; // 메시지 전송 날짜
  jobOptions?: string[]; // 직업 옵션이 있는 경우
}

interface ChatDialogsProps {
  chat: Chat;
  chatContent?: React.ReactNode; // 대화 내용 컴포넌트
  loading?: boolean;
}

const loadingAnimation = keyframes`
  0%, 100% {
    transform: translateY(2px);
  }
  50% {
    transform: translateY(-2px);
  }
`;

const ChatBox = (props: ChatDialogsProps) => {
  const { chat, chatContent, loading } = props;

  const theme = useTheme();

  const loginState = null;
  const profileImage = null;

  // 채팅 렌더 요소
  const chatRender = useMemo(() => {
    if (loading) {
      return (
        <Stack
          direction="row"
          color="text.secondary"
          padding={0.5}
          gap={0.5}
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: theme.typography.subtitle2.fontSize,
              animation: `${loadingAnimation} 1s infinite ease-in-out`,
            },
            "& .MuiSvgIcon-root:nth-of-type(2)": {
              animationDelay: "0.2s",
            },
            "& .MuiSvgIcon-root:nth-of-type(3)": {
              animationDelay: "0.4s",
            },
          }}
        >
          <CircleIcon fontSize="inherit" color="inherit" />
          <CircleIcon fontSize="inherit" color="inherit" />
          <CircleIcon fontSize="inherit" color="inherit" />
        </Stack>
      );
    } else if (chatContent) {
      return chatContent;
    } else {
      return (
        <Typography
          variant="subtitle1"
          sx={{
            wordBreak: "break-all",
          }}
        >
          {chat.content}
        </Typography>
      );
    }
  }, [chat.content, chatContent, loading, theme.typography.subtitle2.fontSize]);

  return (
    <Stack
      width="100%"
      direction={chat.isBot ? "row" : "row-reverse"}
      alignSelf={chat.isBot ? "flex-start" : "flex-end"}
      alignItems="flex-start"
      gap={2}
    >
      {/* 프로필 이미지 */}
      <Stack
        width={50}
        height={50}
        padding={1}
        borderRadius={3}
        border={`2px solid ${chat.isBot ? theme.palette.primary.main : grey[400]
          }`}
      >
        {chat.isBot ? (
          <SmartToyRoundedIcon
            color="primary"
            sx={{
              width: "100%",
              height: "100%",
            }}
          />
        ) : (
          <Avatar
            src={profileImage || undefined}
            sx={{
              bgcolor: grey[400],
              width: "100%",
              height: "100%",
            }}
          >
            {!profileImage &&
              (loginState.userName ? (
                loginState.userName.charAt(0).toUpperCase()
              ) : (
                <FaceRoundedIcon
                  sx={{
                    fontSize: "2rem",
                  }}
                />
              ))}
          </Avatar>
        )}
      </Stack>

      {/* 대화 내용 */}
      <Stack flex={1} alignItems={chat.isBot ? "flex-start" : "flex-end"}>
        {/* 닉네임 */}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color={chat.isBot ? "primary" : "inherit"}
          alignSelf={chat.isBot ? "flex-start" : "flex-end"}
        >
          {chat.isBot ? "잡톡AI" : loginState.userName}
        </Typography>

        {/* 대화 내용 */}
        <Box padding={0.5} paddingX={1} borderRadius={2} bgcolor={grey[100]}>
          {chatRender}
        </Box>
      </Stack>

      {/* 여백 */}
      <Box width={50} />
    </Stack>
  );
};

export default ChatBox;
