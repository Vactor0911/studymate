import { Box, Stack } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import { useParams } from "react-router";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";

interface Chat {
  isBot: boolean;
  content: string;
  date: string;
}

const CurriculumChatBot = () => {
  const { uuid } = useParams<{ uuid: string }>(); // 워크스페이스 uuid
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatbotLoading, setChatbotLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 채팅 컨테이너 스크롤을 최하단으로 이동
  const scrollToBottom = useCallback(() => {
    // 대화 스크롤 최하단으로 이동
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <Stack height="100%" gap={1}>
      {/* 채팅 기록 */}
      <Stack
        ref={chatContainerRef}
        gap={4}
        paddingTop={1}
        overflow="auto"
        flex={1}
      >
        {/* 채팅 기록 */}
        {chats.map((chat, index) => (
          <ChatBox key={`chat-${index}`} chat={chat} />
        ))}

        {/* 챗봇 응답 로딩중 대화상자 */}
        {chatbotLoading && (
          <ChatBox
            chat={{
              isBot: true,
              content: "",
              date: new Date().toISOString(),
            }}
            loading={true}
          />
        )}
      </Stack>

      {/* 채팅 입력란 */}
      <Box width="100%">
        <ChatInput
          // onSend={handleMessageSend}
          onSend={() => {}}
          placeholder="Studymate에게 무엇이든 물어보세요"
          multiline={true}
        />
      </Box>
    </Stack>
  );
};

export default CurriculumChatBot;
