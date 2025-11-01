import { accessTokenAtom, userAtom, type UserType } from "../states/auth";
import { jotaiStore } from "../states/jotaiStore";
import { api } from "../utils/api";

// 회원가입 요청 타입
type SignupRequest = {
  id: string;
  password: string;
  email: string;
};

// 로그인 요청 타입
type LoginRequest = {
  id: string;
  password: string;
};

// 회원가입
export const signup = async (req: SignupRequest) => {
  // 회원가입 API 호출
  return await api.post("/api/auth/signup", req);
};

// 로그인
export const login = async (req: LoginRequest) => {
  // 로그인 API 호출
  const { data } = await api.post("/api/auth/login", req);

  // 토큰 저장
  jotaiStore.set(accessTokenAtom, data.data.accessToken);

  // 내 정보 가져오기
  await fetchMe();
  return data;
};

// 내 정보 조회
export const fetchMe = async () => {
  try {
    const { data } = await api.get<UserType>("/api/user/me");

    // 사용자 정보 저장
    jotaiStore.set(userAtom, {
      uuid: data.uuid,
      user_id: data.user_id,
    });
  } catch {
    // 에러 처리
  }
};

// 로그아웃
export const logout = async () => {
  // 로그아웃 API 호출
  await api.post("/api/auth/logout");
  jotaiStore.set(accessTokenAtom, null);
  jotaiStore.set(userAtom, null);
};

// 앱 초기화 시 인증 상태 부트스트랩
export const bootstrapAuth = async () => {
  try {
    // 내 정보 조회 시도
    const { data } = await api.post("/api/auth/refresh");

    // 토큰 저장
    jotaiStore.set(accessTokenAtom, data.data.accessToken);

    // 내 정보 가져오기
    await fetchMe();
  } catch {
    jotaiStore.set(accessTokenAtom, null);
    jotaiStore.set(userAtom, null);
  }
};
