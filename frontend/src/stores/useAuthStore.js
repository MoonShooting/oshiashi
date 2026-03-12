import React from 'react';
import { create } from 'zustand';
import { FetchClient } from '@/api/FetchClient.js';
// 위치 src기준으로 시작하려면 @/으로 작성합니다.

const getStoredToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

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
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');

    if (rememberMe) {
      localStorage.setItem('accessToken', token);
    } else {
      sessionStorage.setItem('accessToken', token);
    }

    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    set({ user: null, isLoggedIn: false });
    // 여기서 바로 alert를 띄우기보다, 필요시 해당 컴포넌트에서 띄우는 게 더 유연함.
  },

  // 브라우저에서 사이트가 처음 로드될 때 호출하여 로그인 상태 복구
  fetchMe: async () => {
    try {
      const userData = await FetchClient('/api/v1/auth/me');
      set({ user: userData, isLoggedIn: true, isInitialized: true });
    } catch {
      set({ user: null, isLoggedIn: false, isInitialized: true });
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
  },
}));
