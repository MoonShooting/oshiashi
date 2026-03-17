import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    // 로그인 성공 후 원래 가려던 페이지로 복귀할 수 있게 from 경로를 함께 전달합니다.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
