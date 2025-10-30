import { Router } from "express";
import ResultController from '../controllers/result.controller.js';

const resultRouter = Router();

resultRouter.post('/create', ResultController.createResult);
resultRouter.get('/get', ResultController.getResult);

export default resultRouter;