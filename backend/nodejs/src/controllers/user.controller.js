import UserService from "../services/user.service.js";

class UserController {
  // 내 정보 조회
  static async me(req, res) {
    // 사용자 uuid 추출
    const { uuid } = req.user;

    try {
      // 사용자 정보 조회
      const userData = await UserService.getMe(uuid);

      // 성공 응답 반환
      return res.status(200).json(userData);
    } catch (error) {
      // 오류 응답 반환
      console.error(error);
      return res
        .status(500)
        .json({ message: "내 정보 조회 중 오류가 발생했습니다." });
    }
  }
}

export default UserController;
