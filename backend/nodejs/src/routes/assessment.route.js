import { Router } from "express";
import AssessmentController from '../controllers/assessment.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const assessmentRouter = Router();

// RoadMap의 문제를 가져옵니다.
assessmentRouter.get('/getAssessment', requireAuth, AssessmentController.getProblems);
// RoadMap에 문제를 생성합니다.
assessmentRouter.post('/create', requireAuth, AssessmentController.createProblem);
// 문제 풀이 답안을 채점합니다.
assessmentRouter.post('/checkAnswers', requireAuth, AssessmentController.checkAnswers);
// 문제 풀이 후 평가 결과를 가져옵니다.
assessmentRouter.get('/getAssessmentResults', requireAuth, AssessmentController.getAssessmentResults);

export default assessmentRouter;