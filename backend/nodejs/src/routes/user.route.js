import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/me", requireAuth, UserController.me);

export default userRouter;
