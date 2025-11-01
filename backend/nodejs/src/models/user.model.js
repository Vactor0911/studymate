import { dbPool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

class UserModel {
  /**
   * 사용자 userId로 사용자 조회
   * @param {string} userId 사용자 userId
   * @returns {Promise<Object>} 사용자 정보
   */
  static async findByUserId(userId) {
    const users = await dbPool.execute("SELECT * FROM user WHERE user_id = ?", [
      userId,
    ]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * 사용자 id로 사용자 조회
   * @param {string} id 사용자 id
   * @returns {Promise<Object>} 사용자 정보
   */
  static async findById(id) {
    const users = await dbPool.execute("SELECT * FROM user WHERE id = ?", [id]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * 사용자 uuid로 사용자 조회
   * @param {string} uuid 사용자 uuid
   * @returns {Promise<Object>} 사용자 정보
   */
  static async findByUuid(uuid) {
    const users = await dbPool.execute("SELECT * FROM user WHERE uuid = ?", [
      uuid,
    ]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * 사용자 이메일로 사용자 조회
   * @param {string} email 사용자 이메일
   * @returns {Promise<Object>} 사용자 정보
   */
  static async findByEmail(email) {
    const users = await dbPool.execute("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    return users && users.length > 0 ? users[0] : null;
  }

  /**
   * 새 사용자 생성
   * @param {string} id 사용자 아이디
   * @param {string} hashedPassword 해싱된 비밀번호
   * @param {string} email 사용자 이메일
   * @param {Object} connection 데이터베이스 연결 객체
   * @returns {Promise<Object>} 생성된 사용자 정보
   */
  static async create(id, hashedPassword, email, connection = dbPool) {
    const uuid = uuidv4();

    const result = await connection.execute(
      "INSERT INTO user (id, password, email, uuid) VALUES (?, ?, ?, ?)",
      [id, hashedPassword, email, uuid]
    );

    return {
      user_id: result.insertId,
      id,
      uuid,
      email,
    };
  }
}

export default UserModel;
