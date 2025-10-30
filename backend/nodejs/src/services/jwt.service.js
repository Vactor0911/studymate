import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import JwtModel from "../models/jwt.model.js";
import UserModel from "../models/user.model.js";
import { compareToken } from "../utils/bcrypt.js";

class JwtService {
  /**
   * 액세스 토큰 서명
   * @param {string} userUuid 사용자 uuid
   * @returns {string} 서명된 액세스 토큰
   */
  static signAccessToken(userUuid) {
    const payload = { userUuid };

    return jwt.sign(payload, config.jwt.accessTokenSecret, {
      algorithm: "HS256",
      expiresIn: config.jwt.accessTokenExpiresIn,
    });
  }

  /**
   * 액세스 토큰 검증
   * @param {string} token 액세스 토큰
   * @param {Object} options jwt.verify 옵션
   * @returns {Object} 토큰 페이로드
   */
  static verifyAccessToken(token, options = {}) {
    return jwt.verify(token, config.jwt.accessTokenSecret, options);
  }

  /**
   * 리프레시 토큰 서명
   * @param {string} userUuid 사용자 uuid
   * @returns {string} 서명된 리프레시 토큰
   */
  static signRefreshToken(userUuid) {
    const payload = { userUuid };

    return jwt.sign(payload, config.jwt.refreshTokenSecret, {
      algorithm: "HS256",
      expiresIn: config.jwt.refreshTokenExpiresIn,
    });
  }

  /**
   * 리프레시 토큰 검증
   * @param {string} token 리프레시 토큰
   * @param {Object} options jwt.verify 옵션
   * @returns {jwt.Jwt} 토큰 페이로드
   */
  static verifyRefreshToken(token, options = {}) {
    return jwt.verify(token, config.jwt.refreshTokenSecret, options);
  }

  /**
   * 리프레시 토큰 검증
   * @param {jwt.Jwt.payload} payload 토큰 페이로드
   * @param {string} refreshToken 리프레시 토큰
   * @returns {Promise<boolean>} 리프레시 토큰 유효성 여부
   */
  static async validateRefreshToken(payload, refreshToken) {
    // 토큰 페이로드로 사용자 조회
    const user = await UserModel.findByUuid(payload.userUuid);
    const userId = user.user_id;

    // 데이터베이스에서 리프레시 토큰 검증
    return await JwtModel.validateRefreshToken(userId, refreshToken);
  }

  /**
   * 리프레시 토큰 재발급
   * @param {jwt.Jwt.payload} payload 토큰 페이로드
   * @param {string} oldToken 기존 리프레시 토큰
   * @param {string} userAgent 사용자 접속 환경
   * @param {string} ip 사용자 접속 IP 주소
   * @param {Object} connection 데이터베이스 연결 객체
   * @returns {string} 새로 발급된 리프레시 토큰
   */
  static async rotateRefreshToken(
    payload,
    oldToken,
    userAgent,
    ip,
    connection
  ) {
    // 토큰 페이로드로 사용자 조회
    const user = await UserModel.findByUuid(payload.userUuid);
    const userId = user.user_id;

    // 사용자의 리프레시 토큰 전체 검색
    const refreshTokens = await JwtModel.findAllByUserId(userId);

    // 기존 토큰과 일치하는 토큰 찾기
    for (const refreshToken of refreshTokens) {
      if (await compareToken(oldToken, refreshToken.token)) {
        await JwtModel.deleteRefreshTokenById(refreshToken.id, connection);
        break;
      }
    }

    // 새 토큰 발급
    const newRefreshToken = this.signRefreshToken(payload.userUuid);

    // 새 토큰 저장
    await JwtModel.storeRefreshToken(
      userId,
      newRefreshToken,
      userAgent,
      ip,
      connection
    );
    return newRefreshToken;
  }

  /**
   * 리프레시 토큰 저장
   * @param {string} userId 사용자 ID
   * @param {string} refreshToken 리프레시 토큰
   * @param {string} userAgent 사용자 접속 환경
   * @param {string} ip 사용자 접속 IP 주소
   * @param {Object} connection 데이터베이스 연결 객체
   */
  static async storeRefreshToken(
    userId,
    refreshToken,
    userAgent,
    ip,
    connection
  ) {
    // 데이터베이스에 리프레시 토큰 저장
    await JwtModel.storeRefreshToken(
      userId,
      refreshToken,
      userAgent,
      ip,
      connection
    );
  }

  /**
   * 리프레시 토큰 쿠키 설정
   * @param {Response} res
   * @param {string} refreshToken
   */
  static async setRefreshCookie(res, refreshToken) {
    const decoded = (() => {
      // 만료일 계산을 위해 decode 사용(보안 영향 없음)
      const parts = refreshToken.split(".");
      if (parts.length !== 3) {
        return null;
      }
      try {
        return JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
      } catch {
        return null;
      }
    })();

    // 만료시간이 있으면 maxAge 설정
    const maxAgeMs = decoded?.exp ? decoded.exp * 1000 - Date.now() : undefined;

    // 쿠키 설정
    res.cookie(config.cookie.name, refreshToken, {
      httpOnly: config.cookie.httpOnly,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      maxAge: maxAgeMs,
      path: config.cookie.path,
    });
  }

  /**
   * 리프레시 토큰 제거
   * @param {string} token 리프레시 토큰
   * @param {Object} connection 데이터베이스 연결 객체
   */
  static async removeRefreshToken(token, connection) {
    // 토큰에서 사용자 uuid 추출
    const payload = this.verifyRefreshToken(token);
    const userUuid = payload.userUuid;

    // uuid로 사용자 조회
    const user = await UserModel.findByUuid(userUuid);
    const userId = user.user_id;

    await JwtModel.deleteRefreshTokenByUserId(userId, connection);
  }
}

export default JwtService;
