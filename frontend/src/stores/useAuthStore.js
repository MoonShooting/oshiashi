import { create } from 'zustand';

const readStoredToken = () => localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

// 로그인 유지 여부에 따라 local/session 저장소를 분기합니다.
// 현재 브랜치의 NavBar/Sidebar는 storage 값을 기준으로 로그인 여부를 읽기 때문에
// 저장소 동기화만 정확히 맞춰주면 화면 분기가 즉시 일관되게 동작합니다.
export const useAuthStore = create((set) => ({
  user: null,
  isLoggedIn: Boolean(readStoredToken()),

  login: (userData, token, rememberMe = false) => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');

    const targetStorage = rememberMe ? localStorage : sessionStorage;
    targetStorage.setItem('accessToken', token);

    set({ user: userData, isLoggedIn: true });
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('accessToken');
    set({ user: null, isLoggedIn: false });
  },
}));
