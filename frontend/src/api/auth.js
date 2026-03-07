import { fetchClient } from './client';

//client.js에서 설정한 것이 있기 때문에 여기선 양식에 맞추어 엔드포인트, 타입들만 쓰면 됩니다.
// 로그인 API
export const loginAPI = (loginData) => {
  return fetchClient('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });
};

// 회원가입 API
export const registerAPI = (userData) => {
  return fetchClient('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};
