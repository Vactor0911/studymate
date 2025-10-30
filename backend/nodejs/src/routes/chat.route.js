import { Router } from "express";
import ChatController from '../controllers/chat.controller.js';

const chatRouter = Router();

// 채팅 메시지 전송
chatRouter.post('/', ChatController.sendMessage);

export default chatRouter;
