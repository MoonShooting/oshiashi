import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  // !!를 붙여서 값이 있으면 true, 없으면 false가 확실히 되도록
  isLoggedIn: !!localStorage.getItem('accessToken'),

  // 로그인 성공 시 상태 업데이트만 담당 (API 호출은 컴포넌트에서)
  login: (userData, token) => {
    localStorage.setItem('accessToken', token);
    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, isLoggedIn: false });
    // 여기서 바로 alert를 띄우기보다, 필요시 해당 컴포넌트에서 띄우는 게 더 유연함.
  },
}));
