import UserModel from "../models/user.model.js";

class AuthService {
  /**
   * 사용자 uuid로 정보 조회
   * @param {string} uuid 사용자 uuid
   * @returns
   */
  static async getMe(uuid) {
    // uuid로 사용자 조회
    const user = await UserModel.findByUuid(uuid);
    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    // 사용자 데이터 반환
    const userData = {
      uuid: user.uuid,
      user_id: user.id,
    };
    return userData;
  }
}

export default AuthService;
