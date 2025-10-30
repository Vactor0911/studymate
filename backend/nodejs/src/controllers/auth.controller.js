import z from "zod";
import AuthService from "../services/auth.service.js";
import JwtService from "../services/jwt.service.js";
import { dbPool } from "../config/db.js";
import { config } from "../config/index.js";

// 로그인 스키마
const loginSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8),
});

// 회원가입 스키마
const registerSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8),
  email: z.email(),
});

class AuthController {
  // 로그인
  static async login(req, res) {
    // 요청 데이터 검증
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "올바르지 않은 요청입니다.",
      });
    }

    // 요청 데이터 추출
    const { id, password } = parsed.data;

    // 트랜잭션 시작
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      // 로그인 서비스 호출
      const user = await AuthService.login(id, password);

      // 토큰 발급
      const accessToken = JwtService.signAccessToken(user.uuid);
      const refreshToken = JwtService.signRefreshToken(user.uuid);

      // 리프레시 토큰 저장
      await JwtService.storeRefreshToken(
        user.user_id,
        refreshToken,
        req.headers["user-agent"],
        req.ip,
        connection
      );
      await JwtService.setRefreshCookie(res, refreshToken);

      // 트랜잭션 커밋
      await connection.commit();

      // 성공 응답 반환
      return res.status(200).json({
        message: "성공적으로 로그인되었습니다.",
        data: {
          accessToken,
        },
      });
    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback();

      // 오류 응답 반환
      console.error(error);
      return res.status(500).json({
        message: "로그인 중 오류가 발생했습니다.",
      });
    } finally {
      // DB 커넥션 연결 해제
      connection.release();
    }
  }

  // 회원가입
  static async signup(req, res) {
    // 요청 데이터 검증
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "올바르지 않은 요청입니다.",
      });
    }

    // 요청 데이터 추출
    const { id, password, email } = parsed.data;

    // 트랜잭션 시작
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      // 회원가입 서비스 호출
      const newUser = await AuthService.signup(id, password, email, connection);

      // 리프레시 토큰 발급
      const refreshToken = JwtService.signRefreshToken(newUser.uuid);

      // 리프레시 토큰 저장
      await JwtService.storeRefreshToken(
        newUser.user_id,
        refreshToken,
        req.headers["user-agent"],
        req.ip,
        connection
      );
      await JwtService.setRefreshCookie(res, refreshToken);

      // 트랜잭션 커밋
      await connection.commit();

      // 성공 응답 반환
      return res.status(201).json({
        message: "성공적으로 회원가입되었습니다.",
      });
    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback();

      // 오류 응답 반환
      console.error(error);

      // 중복된 아이디 또는 이메일인 경우
      if (error.cause === "DUPLICATE_ID" || error.cause === "DUPLICATE_EMAIL") {
        return res.status(409).json({
          code: error.cause,
          message: error.message,
        });
      }

      return res.status(500).json({
        message: "회원가입 중 오류가 발생했습니다.",
      });
    } finally {
      // DB 커넥션 연결 해제
      connection.release();
    }
  }

  // 로그아웃
  static async logout(req, res) {
    // 쿠키에서 리프레시 토큰 추출
    const refreshToken = req.cookies?.[config.cookie.name];

    // 리프레시 토큰이 없는 경우
    if (!refreshToken) {
      return res.status(401).json({
        message: "유효하지 않은 리프레시 토큰입니다.",
      });
    }

    try {
      // 리프레시 토큰 제거
      await JwtService.removeRefreshToken(refreshToken);

      // 쿠키 제거
      res.clearCookie(config.cookie.name, { path: config.cookie.path });

      // 성공 응답 반환
      return res.status(200).json({
        message: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error) {
      // 오류 응답 반환
      console.error(error);
      return res.status(401).json({
        message: "유효하지 않은 리프레시 토큰입니다.",
      });
    }
  }

  // 토큰 재발급
  static async refreshToken(req, res) {
    // 쿠키에서 리프레시 토큰 추출
    const refreshToken = req.cookies?.[config.cookie.name];
    if (!refreshToken) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    // 리프레시 토큰 검증
    let payload;
    try {
      payload = JwtService.verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
    }

    // 리프레시 토큰 유효성 검사
    const isRefreshTokenValid = await JwtService.validateRefreshToken(
      payload,
      refreshToken
    );
    if (!isRefreshTokenValid) {
      return res.status(401).json({
        message: "유효하지 않은 토큰입니다.",
      });
    }

    // 트랜잭션 시작
    const connection = await dbPool.getConnection();
    await connection.beginTransaction();

    try {
      // 토큰 재발급
      const newAccessToken = JwtService.signAccessToken(payload.userUuid);
      const newRefreshToken = await JwtService.rotateRefreshToken(
        payload,
        refreshToken,
        req.headers["user-agent"],
        req.ip,
        connection
      );
      JwtService.setRefreshCookie(res, newRefreshToken);

      // 트랜잭션 커밋
      await connection.commit();

      // 성공 응답 반환
      return res.status(200).json({
        message: "토큰이 성공적으로 재발급되었습니다.",
        data: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      // 트랜잭션 롤백
      await connection.rollback();

      // 오류 응답 반환
      console.error(error);
      return res.status(500).json({
        message: "토큰 재발급 중 오류가 발생했습니다.",
      });
    } finally {
      // DB 커넥션 연결 해제
      connection.release();
    }
  }
}

export default AuthController;
