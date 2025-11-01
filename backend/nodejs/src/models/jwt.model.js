import { config } from "../config/index.js";
import { dbPool } from "../config/db.js";
import { compareToken, hashToken } from "../utils/bcrypt.js";
import dayjs from "dayjs";

/**
 * 만료 기간 파싱
 * @param {string} expiry 만료 기간 문자열 (예: "30d", "12h")
 * @returns {Object} 만료 기간 객체
 */
function parseExpiry(expiry) {
  const m = expiry.match(/^(\d+)([smhd])$/);
  if (!m) return { days: 30 };
  const n = Number(m[1]);
  const u = m[2];
  if (u === "s") return { seconds: n };
  if (u === "m") return { minutes: n };
  if (u === "h") return { hours: n };
  if (u === "d") return { days: n };
  return { days: 30 };
}

class JwtModel {
  /**
   * 사용자 ID로 리프레시 토큰 전체 조회
   * @param {string} userId
   * @returns {Promise<Array>} 리프레시 토큰 목록
   */
  static async findAllByUserId(userId) {
    const rows = await dbPool.execute(
      `SELECT * FROM refresh_token WHERE user_id = ?`,
      [userId]
    );
    return rows && rows.length > 0 ? rows : [];
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
    connection = dbPool
  ) {
    // 리프레시 토큰 해싱
    const hashedRefreshToken = await hashToken(refreshToken);

    // 만료일 계산
    const now = dayjs();
    const delta = parseExpiry(config.jwt.refreshTokenExpiresIn);
    const expiresAt = now
      .add(delta.days ?? 0, "day")
      .add(delta.hours ?? 0, "hour")
      .add(delta.minutes ?? 0, "minute")
      .add(delta.seconds ?? 0, "second")
      .toDate(); // 네이티브 Date 형태로 변환

    // 데이터베이스에 리프레시 토큰 저장
    await connection.execute(
      `INSERT INTO refresh_token (user_id, token, expires_at, user_agent, ip)
        VALUES (?, ?, ?, ?, ?)`,
      [userId, hashedRefreshToken, expiresAt, userAgent, ip]
    );
  }

  /**
   * 리프레시 토큰 검증
   * @param {string} userId 사용자 ID
   * @param {string} refreshToken 리프레시 토큰
   * @param {Object} connection 데이터베이스 연결 객체
   * @returns {Promise<boolean>} 리프레시 토큰 유효성 여부
   */
  static async validateRefreshToken(userId, refreshToken, connection = dbPool) {
    // 사용자 ID로 유효한 리프레시 토큰 조회
    const rows = await connection.execute(
      `SELECT id, token, expires_at
        FROM refresh_token
        WHERE user_id = ? AND expires_at > NOW()
        ORDER BY id DESC
        LIMIT 50`,
      [userId]
    );

    // 토큰 유효성 비교
    for (const row of rows) {
      if (await compareToken(refreshToken, row.token)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 리프레시 토큰 ID로 리프레시 토큰 삭제
   * @param {string} id 리프레시 토큰 ID
   * @param {Object} connection 데이터베이스 연결 객체
   */
  static async deleteRefreshTokenById(id, connection = dbPool) {
    await connection.execute(`DELETE FROM refresh_token WHERE id = ?`, [id]);
  }

  /**
   * 사용자 ID로 리프레시 토큰 삭제
   * @param {string} userId 사용자 ID
   * @param {Object} connection 데이터베이스 연결 객체
   */
  static async deleteRefreshTokenByUserId(userId, connection = dbPool) {
    await connection.execute(`DELETE FROM refresh_token WHERE user_id = ?`, [
      userId,
    ]);
  }
}

export default JwtModel;
