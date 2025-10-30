import ChatService from "../services/chat.service.js";

class ChatController {
    /**
     * 채팅 메시지를 처리합니다.
     */
    static async sendMessage(req, res) {
        try {
            const { message } = req.body;
            
            if (!message || typeof message !== 'string') {
                return res.status(400).json({ 
                    message: "메시지가 필요합니다.",
                    error: "message 필드는 필수이며 문자열이어야 합니다." 
                });
            }
            
            const reply = await ChatService.sendMessage(message);
            res.status(200).json({ reply });
        } catch (error) {
            res.status(500).json({ 
                message: "채팅 응답 생성 실패", 
                error: error.message 
            });
        }
    }
}

export default ChatController;
