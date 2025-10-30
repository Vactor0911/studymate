import { callFastAPI } from '../utils/fastapi.js';

class ChatService {
    /**
     * FastAPI 챗봇에 메시지를 전송하고 응답을 받습니다.
     * @param {string} message - 사용자 메시지
     * @returns {Promise<string>} AI 응답 텍스트
     */
    static async sendMessage(message) {
        try {
            const response = await callFastAPI('/api/chat', {
                message
            });
            
            // 응답: { reply: "AI 답변 텍스트" }
            return response.reply;
        } catch (error) {
            throw new Error(`채팅 서비스 오류: ${error.message}`);
        }
    }
}

export default ChatService;
