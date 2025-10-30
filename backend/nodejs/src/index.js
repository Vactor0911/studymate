import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "./config/index.js";
import {
  authRouter,
  userRouter,
  assessmentRouter,
  curriculumRouter
} from "./routes/index.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://hanataba227.github.io"
        : `http://localhost:8080`,
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API 라우팅
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/assessments", assessmentRouter);
app.use("/api/curriculums", curriculumRouter);

// 헬스체크
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(config.port, () => {
  console.log(`[SERVER] 서버가 ${config.port}번 포트에서 실행 중입니다.`);
});

// 프로세스 종료 핸들러
process.on("SIGTERM", () => {
  console.log("[SERVER] 서버가 종료됩니다.");
  process.exit(0);
});
