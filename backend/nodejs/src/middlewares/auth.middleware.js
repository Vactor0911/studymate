import JwtService from "../services/jwt.service.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;

  // 인증 헤더 검증
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "인증 헤더가 올바르지 않습니다." });
  }

  //토큰 검증
  const token = header.slice("Bearer ".length);
  try {
    // 토큰 페이로드 추출
    const payload = JwtService.verifyAccessToken(token);

    // 요청 객체에 사용자 정보 추가
    req.user = {
      id: payload.userId || 1, // userId 추가
      uuid: payload.userUuid,
    };
    next();
  } catch {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

export default requireAuth;
