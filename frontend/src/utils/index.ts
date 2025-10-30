export const MAX_MESSAGE_LENGTH = 100; // 채팅 메시지 길이 제한

/**
 * 채팅 메시지가 유효한지 확인하는 함수
 * @param message 채팅 메시지
 * @returns 메시지가 유효한지 여부
 */
export const isChatMessageValid = (message: string) => {
  // 메시지가 비어있거나 길이가 초과하는 경우
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return false;
  }

  // 메시지 형식이 올바른 경우
  return true;
};
