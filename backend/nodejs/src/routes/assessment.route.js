import { Router } from "express";
import AssessmentController from '../controllers/assessment.controller.js';

const assessmentRouter = Router();

// RoadMap의 문제를 가져옵니다.
assessmentRouter.get('/getAssessment', AssessmentController.getProblems);
// RoadMap에 문제를 생성합니다.
assessmentRouter.post('/create', AssessmentController.createProblem);
// 문제 풀이 답안을 채점합니다.
assessmentRouter.post('/checkAnswers', AssessmentController.checkAnswers);
// 문제 풀이 후 평가 결과를 가져옵니다.
assessmentRouter.get('/getAssessmentResults', AssessmentController.getAssessmentResults);

export default assessmentRouter;