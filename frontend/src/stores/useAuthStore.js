import { create } from 'zustand';
import { getMyInfoAPI } from '@/api/auth.js';
// 위치 src기준으로 시작하려면 @/으로 작성합니다.

/*
[인증 저장소 토큰 정책]
- rememberMe=true  -> localStorage (브라우저 재시작 후에도 유지)
- rememberMe=false -> sessionStorage (탭/브라우저 종료 시 정리)
- 읽기 시에는 두 저장소를 모두 확인해 기존 로그인 정책을 흡수
*/
const getStoredToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

// /me 호출이 일시 실패해도 userId 최소값을 유지하기 위한 JWT payload 해석 유틸
const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const extractUserIdFromToken = (rawToken) => {
  if (!rawToken) return '';

  const token = String(rawToken).replace(/^Bearer\s+/i, '').trim();
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return '';

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    const candidate = payload?.userId ?? payload?.sub ?? payload?.username ?? '';
    return typeof candidate === 'string' ? candidate.trim() : '';
  } catch {
    return '';
  }
};

// 로그아웃/재로그인 직전, 저장소 충돌을 막기 위해 토큰은 항상 한 번에 정리합니다.
const clearStoredToken = () => {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
};

//로그인은 사용자 정보를 서비스 전체에서 계속 유지(State)해야 하므로 Store 필수
export const useAuthStore = create((set) => ({
  user: null,
  // !!를 붙여서 값이 있으면 true, 없으면 false가 확실히 되도록
  isLoggedIn: !!getStoredToken(),
  isEmailVerified: false, // 이메일 인증 완료 여부 추가
  isInitialized: false, // 초기화 여부, 새로고침 시 토큰 검증이 끝나기 전까지 화면이 깜빡이는 현상(Flicker)을 방지

  // 이메일 인증 상태 업데이트 함수(인증 성공 시 호출할 함수)
  setEmailVerified: (status) => set({ isEmailVerified: status }),

  // 로그인 성공 시 상태 업데이트만 담당합니다.
  // rememberMe가 true면 localStorage, false면 sessionStorage를 사용해 브라우저 종료 시점 동작을 구분합니다.
  login: (userData, token, rememberMe = false) => {
    clearStoredToken();

    if (rememberMe) {
      localStorage.setItem('accessToken', token);
    } else {
      sessionStorage.setItem('accessToken', token);
    }

    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    clearStoredToken();
    set({ user: null, isLoggedIn: false });
    // 여기서 바로 alert를 띄우기보다, 필요시 해당 컴포넌트에서 띄우는 게 더 유연함.
  },

  // 브라우저에서 사이트가 처음 로드될 때 호출하여 로그인 상태 복구
  fetchMe: async () => {
    const token = getStoredToken();

    // 저장된 토큰이 없으면 복구 요청을 보내지 않고 초기화만 완료합니다.
    if (!token) {
      set({ user: null, isLoggedIn: false, isInitialized: true });
      return;
    }

    try {
      // 핵심 복구 API: getMyInfoAPI()
      // - /api/v1/auth/me 또는 /api/v1/user/me 중 사용 가능한 경로를 조회
      // - 토큰이 유효하면 최신 사용자 정보를 반환
      // - 프론트는 이 응답으로 새로고침 후 Zustand 상태를 복원
      const userData = await getMyInfoAPI();
      set({ user: userData, isLoggedIn: true, isInitialized: true });
    } catch (error) {
      // 인증 실패(만료/위조 토큰)는 토큰을 제거하고 로그아웃 처리합니다.
      // 네트워크 일시 오류는 토큰을 유지해 재시도 여지를 남깁니다.
      const authFailed =
        error?.status === 401 ||
        error?.status === 403 ||
        /unauthorized|forbidden|토큰|인증/i.test(String(error?.message ?? ''));

      if (authFailed) {
        // 토큰이 이미 무효하므로 즉시 정리하고 비로그인 상태로 확정합니다.
        clearStoredToken();
        set({ user: null, isLoggedIn: false, isInitialized: true });
        return;
      }

      // 네트워크/일시 장애처럼 "인증 실패로 확정할 수 없는" 경우:
      // - 토큰은 유지
      // - user가 완전히 null이 되지 않도록 토큰의 userId를 최소 복구
      set((state) => {
        const fallbackUserId = extractUserIdFromToken(token);
        const fallbackUser = fallbackUserId ? { userId: fallbackUserId } : null;

        return {
          user: state.user ?? fallbackUser,
          isLoggedIn: true,
          isInitialized: true,
        };
      });
    }
  },
}));
