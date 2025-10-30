import UserModel from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";

class AuthService {
  /**
   * 사용자 로그인
   * @param {string} id 사용자 아이디
   * @param {string} password 사용자 비밀번호
   * @returns {Promise<Object>} 사용자 정보
   */
  static async login(id, password) {
    // 아이디로 사용자 조회
    const user = await UserModel.findById(id);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 비밀번호 검증
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("비밀번호가 일치하지 않습니다.");
    }

    return user;
  }

  /**
   * 사용자 회원가입
   * @param {string} id 사용자 아이디
   * @param {string} password 사용자 비밀번호
   * @param {string} email 사용자 이메일
   * @param {Object} connection 데이터베이스 연결 객체
   * @returns {Promise<Object>} 생성된 사용자 정보
   */
  static async signup(id, password, email, connection) {
    // 아이디 중복 확인
    const existingUser = await UserModel.findById(id);
    if (existingUser) {
      throw new Error("이미 존재하는 아이디입니다.", { cause: "DUPLICATE_ID" });
    }

    // 이메일 중복 확인
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      throw new Error("이미 존재하는 이메일입니다.", { cause: "DUPLICATE_EMAIL" });
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const newUser = await UserModel.create(
      id,
      hashedPassword,
      email,
      connection
    );

    return newUser;
  }
}

export default AuthService;
