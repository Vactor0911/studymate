import { Router } from "express";
import CurriculumController from '../controllers/curriculum.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const curriculumRouter = Router();

// User의 RoadMap을 가져옵니다
curriculumRouter.get('/getRoadmaps', requireAuth, CurriculumController.getRoadMaps);
// User의 특정 RoadMap을 가져옵니다
curriculumRouter.get('/getRoadMap/:curriculumUuid', requireAuth, CurriculumController.getRoadMap);
// RoadMap을 생성합니다
curriculumRouter.post('/create', requireAuth, CurriculumController.createRoadMap);
// RoadMap을 업데이트합니다 (평가 결과 기반)
curriculumRouter.post('/update', requireAuth, CurriculumController.updateCurriculum);

export default curriculumRouter;