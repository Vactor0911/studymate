import { Router } from "express";
import FeedbackController from '../controllers/feedback.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const feedbackRouter = Router();

// AI 피드백 생성
feedbackRouter.post('/generate', requireAuth, FeedbackController.generateFeedback);

export default feedbackRouter;
