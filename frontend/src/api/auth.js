import { FetchClient } from './FetchClient';

// 로그인/회원가입 관련 API는 이 파일에서만 엔드포인트를 관리합니다.
// 컴포넌트는 네트워크 상세 구현 대신 함수 호출에만 집중합니다.
export const loginAPI = (loginData) =>
  FetchClient('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

export const registerAPI = (userData) =>
  FetchClient('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
