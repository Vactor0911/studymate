import bcrypt from "bcrypt";

/**
 * 사용자 비밀번호 해싱
 * @param {string} password 사용자 비밀번호
 * @returns {string} 해싱된 비밀번호
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

/**
 * 사용자 비밀번호 비교
 * @param {string} password 사용자 비밀번호
 * @param {string} hashedPassword 해싱된 사용자 비밀번호
 * @returns {boolean} 비밀번호 일치 여부
 */
export async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * JWT 토큰 해싱
 * @param {string} token JWT 토큰
 * @returns {string} 해싱된 JWT 토큰
 */
export async function hashToken(token) {
  return await bcrypt.hash(token, 12);
}

/**
 * JWT 토큰 비교
 * @param {string} token JWT 토큰
 * @param {string} hashedToken 해싱된 JWT 토큰
 * @returns {boolean} 토큰 일치 여부
 */
export async function compareToken(token, hashedToken) {
  return await bcrypt.compare(token, hashedToken);
}
