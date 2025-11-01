import { Router } from "express";
import CurriculumController from '../controllers/curriculum.controller.js';

const curriculumRouter = Router();

// User의 RoadMap을 가져옵니다
curriculumRouter.get('/getRoadmaps', CurriculumController.getRoadMaps);
// User의 특정 RoadMap을 가져옵니다
curriculumRouter.get('/getRoadMap/:curriculumUuid', CurriculumController.getRoadMap);
// RoadMap을 생성합니다
curriculumRouter.post('/create', CurriculumController.createRoadMap);

export default curriculumRouter;