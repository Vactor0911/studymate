import { Router } from "express";
import AuthController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/login", AuthController.login);
authRouter.post("/signup", AuthController.signup);
authRouter.post("/logout", requireAuth, AuthController.logout);
authRouter.post("/refresh", AuthController.refreshToken);

export default authRouter;
