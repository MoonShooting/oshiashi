import { create } from 'zustand';
import { getMyInfoAPI } from '@/api/auth.js';
// 위치 src기준으로 시작하려면 @/으로 작성합니다.

let tokenExpiryTimeoutId = null;
let tokenCountdownIntervalId = null;

/*
[인증 저장소 토큰 정책]
- rememberMe=true  -> localStorage (브라우저 재시작 후에도 유지)
- rememberMe=false -> sessionStorage (탭/브라우저 종료 시 정리)
- 읽기 시에는 두 저장소를 모두 확인해 기존 로그인 정책을 흡수
*/
const getStoredToken = () => localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

// /me 호출이 일시 실패해도 userId 최소값을 유지하기 위한 JWT payload 해석 유틸
const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const parseTokenPayload = (rawToken) => {
  if (!rawToken) return null;

  const token = String(rawToken)
    .replace(/^Bearer\s+/i, '')
    .trim();
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return null;

  try {
    return JSON.parse(decodeBase64Url(payloadPart));
  } catch {
    return null;
  }
};

const extractTokenExpiryAt = (rawToken) => {
  const payload = parseTokenPayload(rawToken);
  const exp = Number(payload?.exp);
  return Number.isFinite(exp) && exp > 0 ? exp * 1000 : null;
};

const getRemainingMs = (expiresAt) => {
  if (!Number.isFinite(expiresAt)) return 0;
  return Math.max(0, expiresAt - Date.now());
};

const extractUserIdFromToken = (rawToken) => {
  const payload = parseTokenPayload(rawToken);
  const candidate = payload?.userId ?? payload?.sub ?? payload?.username ?? '';
  return typeof candidate === 'string' ? candidate.trim() : '';
};

// 로그아웃/재로그인 직전, 저장소 충돌을 막기 위해 토큰은 항상 한 번에 정리합니다.
const clearStoredToken = () => {
  localStorage.removeItem('accessToken');
  sessionStorage.removeItem('accessToken');
};

const clearTokenTimers = () => {
  if (tokenExpiryTimeoutId != null) {
    clearTimeout(tokenExpiryTimeoutId);
    tokenExpiryTimeoutId = null;
  }

  if (tokenCountdownIntervalId != null) {
    clearInterval(tokenCountdownIntervalId);
    tokenCountdownIntervalId = null;
  }
};

const applyLoggedOutState = (set, isInitialized = true) => {
  clearStoredToken();
  clearTokenTimers();
  set({
    user: null,
    isLoggedIn: false,
    isInitialized,
    tokenExpiresAt: null,
    tokenRemainingMs: 0,
  });
};

const setupTokenLifecycle = (token, set) => {
  clearTokenTimers();

  const tokenExpiresAt = extractTokenExpiryAt(token);
  if (tokenExpiresAt == null) {
    return {
      tokenExpiresAt: null,
      tokenRemainingMs: 0,
      isExpired: false,
    };
  }

  const tokenRemainingMs = getRemainingMs(tokenExpiresAt);
  if (tokenRemainingMs <= 0) {
    applyLoggedOutState(set);
    return {
      tokenExpiresAt: null,
      tokenRemainingMs: 0,
      isExpired: true,
    };
  }

  tokenExpiryTimeoutId = setTimeout(() => {
    applyLoggedOutState(set);
  }, tokenRemainingMs);

  tokenCountdownIntervalId = setInterval(() => {
    const nextRemainingMs = getRemainingMs(tokenExpiresAt);

    if (nextRemainingMs <= 0) {
      applyLoggedOutState(set);
      return;
    }

    set({ tokenRemainingMs: nextRemainingMs });
  }, 1000);

  return {
    tokenExpiresAt,
    tokenRemainingMs,
    isExpired: false,
  };
};

const getInitialTokenSession = () => {
  const token = getStoredToken();
  if (!token) {
    return {
      token: '',
      tokenExpiresAt: null,
      tokenRemainingMs: 0,
    };
  }

  const tokenExpiresAt = extractTokenExpiryAt(token);
  if (tokenExpiresAt != null && getRemainingMs(tokenExpiresAt) <= 0) {
    clearStoredToken();
    return {
      token: '',
      tokenExpiresAt: null,
      tokenRemainingMs: 0,
    };
  }

  return {
    token,
    tokenExpiresAt,
    tokenRemainingMs: tokenExpiresAt != null ? getRemainingMs(tokenExpiresAt) : 0,
  };
};

const initialTokenSession = getInitialTokenSession();

//로그인은 사용자 정보를 서비스 전체에서 계속 유지(State)해야 하므로 Store 필수
export const useAuthStore = create((set) => ({
  user: null,
  // !!를 붙여서 값이 있으면 true, 없으면 false가 확실히 되도록
  isLoggedIn: !!initialTokenSession.token,
  isEmailVerified: false, // 이메일 인증 완료 여부 추가
  isInitialized: false, // 초기화 여부, 새로고침 시 토큰 검증이 끝나기 전까지 화면이 깜빡이는 현상(Flicker)을 방지
  tokenExpiresAt: initialTokenSession.tokenExpiresAt,
  tokenRemainingMs: initialTokenSession.tokenRemainingMs,

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

    const session = setupTokenLifecycle(token, set);
    if (session.isExpired) {
      return;
    }

    set({
      user: userData,
      isLoggedIn: true,
      isInitialized: true,
      tokenExpiresAt: session.tokenExpiresAt,
      tokenRemainingMs: session.tokenRemainingMs,
    });
  },

  logout: () => {
    applyLoggedOutState(set);
    // 여기서 바로 alert를 띄우기보다, 필요시 해당 컴포넌트에서 띄우는 게 더 유연함.
  },

  // 브라우저에서 사이트가 처음 로드될 때 호출하여 로그인 상태 복구
  fetchMe: async () => {
    const { isInitialized } = useAuthStore.getState();
    if (isInitialized) return; // 중복 방지
    const token = getStoredToken();

    // 저장된 토큰이 없으면 복구 요청을 보내지 않고 초기화만 완료합니다.
    if (!token) {
      applyLoggedOutState(set);
      return;
    }

    const session = setupTokenLifecycle(token, set);
    if (session.isExpired) {
      return;
    }

    try {
      // 핵심 복구 API: getMyInfoAPI()
      // - /api/v1/auth/me 또는 /api/v1/user/me 중 사용 가능한 경로를 조회
      // - 토큰이 유효하면 최신 사용자 정보를 반환
      // - 프론트는 이 응답으로 새로고침 후 Zustand 상태를 복원
      const userData = await getMyInfoAPI();
      set({
        user: userData,
        isLoggedIn: true,
        isInitialized: true,
        tokenExpiresAt: session.tokenExpiresAt,
        tokenRemainingMs: session.tokenRemainingMs,
      });
    } catch (error) {
      // 인증 실패(만료/위조 토큰)는 토큰을 제거하고 로그아웃 처리합니다.
      // 네트워크 일시 오류는 토큰을 유지해 재시도 여지를 남깁니다.
      const authFailed = error?.status === 401 || error?.status === 403 || /unauthorized|forbidden|토큰|인증/i.test(String(error?.message ?? ''));

      if (authFailed) {
        // 토큰이 이미 무효하므로 즉시 정리하고 비로그인 상태로 확정합니다.
        applyLoggedOutState(set);
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
          tokenExpiresAt: session.tokenExpiresAt,
          tokenRemainingMs: session.tokenRemainingMs,
        };
      });
    }
  },
}));

// 저장된 토큰이 있으면 카운트다운 타이머를 즉시 시작 (fetchMe 완료 전에도 NavBar가 올바른 시간 표시)
// fetchMe()도 setupTokenLifecycle을 호출하지만 내부에서 clearTokenTimers()로 이전 타이머를 정리함
if (initialTokenSession.token) {
  setupTokenLifecycle(initialTokenSession.token, useAuthStore.setState);
}
