import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, isInitialized } = useAuthStore();

  // 중요:
  // isInitialized=false 구간은 "새로고침 직후 /auth/me 복구 중" 상태입니다.
  // 이때 바로 /login으로 보내면 유효 토큰 사용자도 튕기는 레이스가 생깁니다.
  // /auth/me 기반 초기 복구가 끝나기 전에는 리다이렉트 판정을 잠시 유예합니다.
  if (!isInitialized) {
    return null;
  }

  if (!isLoggedIn) {
    // 로그인 성공 후 원래 가려던 페이지로 복귀할 수 있게 from 경로를 함께 전달합니다.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
