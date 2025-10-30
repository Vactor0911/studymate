import { Router } from "express";
import RoadMapController from '../controllers/roadmap.controller.js';

const roadMapRouter = Router();

// User의 RoadMap을 가져옵니다
roadMapRouter.get('/getRoadmaps', RoadMapController.getRoadMaps);
// User의 특정 RoadMap을 가져옵니다
roadMapRouter.get('/getRoadMap/:roadmapUuid', RoadMapController.getRoadMap);
// RoadMap을 생성합니다
roadMapRouter.post('/create', RoadMapController.createRoadMap);

export default roadMapRouter;