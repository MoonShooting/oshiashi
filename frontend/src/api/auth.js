import { FetchClient } from './FetchClient.js';

//FetchClient.js에서 설정한 것이 있기 때문에 여기선 양식에 맞추어 엔드포인트, 타입들만 쓰면 됩니다.
//email 전송 API
export const sendEmailAPI = (email) => {
  return FetchClient('/api/v1/auth/emailSend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};
//email 검증 API
export const verifyEmailAPI = (email, code) => {
  return FetchClient('/api/v1/auth/emailVerify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
};
//email 체크 API
export const checkEmailAPI = (email) => {
  // GET 방식이므로 쿼리 파라미터로 전달
  return FetchClient(`/api/v1/auth/checkEmail?email=${email}`, {
    method: 'GET',
  });
};

//아이디(id) 체크 API
export const checkIdAPI = (userId) => {
  return FetchClient(`/api/v1/auth/checkId?userId=${userId}`, {
    method: 'GET',
  });
};

// 닉네임 중복 체크 API
export const checkNicknameAPI = (nickname) => {
  return FetchClient(`/api/v1/auth/checkNickname?nickname=${nickname}`, {
    method: 'GET',
  });
};

// 로그인 API
export const loginAPI = (loginData) => {
  return FetchClient('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });
};

// 회원가입 API
export const registerAPI = (userData) => {
  return FetchClient('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};
