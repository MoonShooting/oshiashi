import React from 'react';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import Router from './router/Router';

function App() {
  const { fetchMe, isInitialized } = useAuthStore();

  // 로그인 되어 있던 경우, 유저 정보 확인 및 복구 시도
  useEffect(() => {
    fetchMe(); // 사이트 접속 시 1회 호출
  }, []);

  return <Router />;
}

export default App;
