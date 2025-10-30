import { Router } from "express";
import ProblemController from '../controllers/problem.controller.js';

const problemRouter = Router();

// RoadMap의 문제를 가져옵니다.
problemRouter.get('/getProblems', ProblemController.getProblems);
// RoadMap에 문제를 생성합니다.
problemRouter.post('/create', ProblemController.createProblem);

problemRouter.post('/checkAnswers', ProblemController.checkAnswers);

export default problemRouter;