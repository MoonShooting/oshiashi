import React from 'react';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import Router from '@/router/Router';

function App() {
  //구조분해 ❌ → 리렌더 트리거됨
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // 로그인 되어 있던 경우, 유저 정보 확인 및 복구 시도
  useEffect(() => {
    if (!isInitialized) {
      fetchMe();
    }
  }, [isInitialized]);

  return <Router />;
}

export default App;
