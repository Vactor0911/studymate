// 간단한 테스트 서버
import express from "express";
import "dotenv/config";

const app = express();
app.use(express.json());

console.log("환경변수 PORT:", process.env.PORT);

const port = Number(process.env.PORT) || 4000;
console.log("파싱된 포트:", port);
console.log("포트 타입:", typeof port);

app.get("/health", (_req, res) => {
    console.log("[요청] /health 엔드포인트 호출됨");
    res.json({ ok: true, message: "Server is running!" });
});

app.get("/test", (_req, res) => {
    res.json({ 
        message: "Test endpoint",
        port: port
    });
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`✅ 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

server.on('error', (error) => {
    console.error("❌ 서버 에러:", error);
});
