import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { jotaiStore } from "../states/jotaiStore";
import { accessTokenAtom } from "../states/auth";

// 동시 refresh 제어
let refreshing = false;
let waiters: Array<(t: string | null) => void> = [];

// refresh 중이면 대기
const waitForRefresh = () =>
  new Promise<string | null>((res) => waiters.push(res));

// refresh 완료 알림
const resolveWaiters = (token: string | null) => {
  waiters.forEach((fn) => fn(token));
  waiters = [];
};

// 기본 API 인스턴스
export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // RefreshToken 쿠키 전송
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

// 인터셉터 미적용 인스턴스 (무한루프 방지용)
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // RefreshToken 쿠키 전송
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Access 토큰 읽기
  const accessToken = jotaiStore.get(accessTokenAtom);
  if (accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as AxiosRequestHeaders)[
      "Authorization"
    ] = `Bearer ${accessToken}`;
  }

  // 설정 반환
  return config;
});

// 응답 인터셉터: 401 응답이면 1회 refresh 시도
api.interceptors.response.use(
  // 성공 응답은 그대로 반환
  (res) => res,

  // 실패 응답 처리
  async (err: AxiosError) => {
    // 네트워크 오류 등 응답이 없는 경우 재발송 불가
    if (!err.response) {
      throw err;
    }

    // 무한루프 방지용 플래그 추가
    const original = err.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // refresh 호출 안함 (루프/데드락 방지)
    if (original?.url?.includes("/api/auth/refresh")) {
      throw err;
    }

    // 401 응답 및 재시도 이전이면 토큰 갱신 시도
    if (err.response.status === 401 && !original?._retry) {
      original._retry = true;

      // 이미 갱신 중이면 대기
      if (refreshing) {
        const newToken = await waitForRefresh();

        // 재차 실패시 재발송 불가
        if (!newToken) {
          throw err;
        }

        // 갱신된 토큰으로 재발송
        original.headers = AxiosHeaders.from(original.headers || {});
        original.headers.set("Authorization", `Bearer ${newToken}`);

        return api.request(original);
      }

      // 토큰 갱신 시도
      try {
        refreshing = true;

        // 인터셉터 미적용 인스턴스로 refresh 호출
        const { data } = await refreshApi.post<{
          accessToken: string;
        }>("/api/auth/refresh");

        // 갱신된 토큰 저장
        jotaiStore.set(accessTokenAtom, data.accessToken);

        // 대기 중인 요청 재발송
        resolveWaiters(data.accessToken);
        refreshing = false;

        // 원래 요청 재발송
        original.headers = AxiosHeaders.from(original.headers || {});
        original.headers.set("Authorization", `Bearer ${data.accessToken}`);
        return api.request(original);
      } catch (err) {
        // 갱신 실패시 모두 실패 처리
        resolveWaiters(null);
        refreshing = false;
        jotaiStore.set(accessTokenAtom, null);
        throw err;
      }
    }
    throw err;
  }
);
