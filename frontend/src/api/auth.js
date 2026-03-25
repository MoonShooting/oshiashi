import { FetchClient } from './FetchClient.js';

//FetchClient.js에서 설정한 것이 있기 때문에 여기선 양식에 맞추어 엔드포인트, 타입들만 쓰면 됩니다.
// 1. 이메일 전송 API
export const sendEmailAPI = (email, type) => {
  return FetchClient('/api/v1/auth/emailSend', {
    method: 'POST',
    body: JSON.stringify({ email, type}),
  });
};

// 2. 이메일 검증 API
export const verifyEmailAPI = (email, code, type) => {
  return FetchClient('/api/v1/auth/emailVerify', {
    method: 'POST',
    body: JSON.stringify({ email, code, type}),
  });
};

// 3. 이메일 중복 체크 API (GET)
export const checkEmailAPI = (email) => {
  return FetchClient(`/api/v1/auth/checkEmail?email=${email}`, {
    method: 'GET',
  });
};

// 4. 아이디 중복 체크 API (GET)
export const checkIdAPI = (userId) => {
  return FetchClient(`/api/v1/auth/checkId?userId=${userId}`, {
    method: 'GET',
  });
};

// 5. 닉네임 중복 체크 API (GET)
export const checkNicknameAPI = (nickname) => {
  return FetchClient(`/api/v1/auth/checkNickname?nickname=${nickname}`, {
    method: 'GET',
  });
};

// 6. 로그인 API (POST) - DTO: UserLoginRequest
/*
[로그인 응답 정규화]
- 백엔드/브랜치 상태에 따라 로그인 응답 형태가 달라질 수 있습니다.
  1) "jwt-token-string"
  2) { token } / { accessToken } / { jwtToken }
  3) { data: { token } } 래핑
- 프론트는 항상 { token, userInfo } 형태로 받아 동일하게 처리합니다.
*/
const extractAccessToken = (response) => {
  if (typeof response === 'string') {
    return response.replace(/^Bearer\s+/i, '').trim();
  }

  const candidate =
    response?.accessToken ??
    response?.token ??
    response?.jwtToken ??
    response?.data?.accessToken ??
    response?.data?.token ??
    response?.result?.accessToken ??
    response?.result?.token ??
    '';

  return typeof candidate === 'string' ? candidate.replace(/^Bearer\s+/i, '').trim() : '';
};

const extractUserInfo = (response) =>
  response?.userInfo ??
  response?.user ??
  response?.data?.userInfo ??
  response?.data?.user ??
  response?.result?.userInfo ??
  response?.result?.user ??
  null;

export const loginAPI = async (loginData) => {
  // loginData = { userId, password }
  const response = await FetchClient('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });

  const token = extractAccessToken(response);
  if (!token) {
    throw new Error('로그인 토큰을 확인하지 못했습니다.');
  }

  return {
    token,
    userInfo: extractUserInfo(response),
  };
};

// 6-1. 내 정보 조회 API (GET)
// - 로그인 상태 복구는 /api/v1/auth/me 단일 엔드포인트를 사용합니다.
// - 응답 래핑(data/result) 유무를 흡수해 항상 사용자 객체를 반환합니다.
export const getMyInfoAPI = async () => {
  const response = await FetchClient('/api/v1/auth/me', {
    method: 'GET',
  });
  return response?.data ?? response?.result ?? response;
};

// 7. 로그아웃 API (POST)
export const logoutAPI = () => {
  return FetchClient('/api/v1/auth/logout', {
    method: 'POST',
  });
};

// 8. 회원가입 API (POST) - DTO: UserSignUpRequest
export const registerAPI = (userData) => {
  // userData = { userId, name, email, password, nickname }
  return FetchClient('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

// 9. 현재 비밀번호 확인 API (POST) - 이름 중복 수정
export const checkPasswordAPI = (password) => {
  return FetchClient('/api/v1/auth/checkPw', {
    method: 'POST',
    body: JSON.stringify({ password }), // 객체 형태로 감싸서 전달
  });
};

// 10. 비밀번호 변경 (PATCH) - 로그인 상태
export const updatePasswordAPI = (oldPassword, newPassword) => {
  return FetchClient('/api/v1/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
};

// 11. 비밀번호 재설정 메일 발송 (POST) - 매개변수 추가
export const passwordResetEmailAPI = (email) => {
  return FetchClient('/api/v1/auth/passwordResetEmail', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// 12. 비밀번호 재설정 완료 (PATCH) - 키값 수정 (email, newPassword)
export const passwordResetConfirmAPI = (email, newPassword) => {
  return FetchClient('/api/v1/auth/passwordResetConfirm', {
    method: 'PATCH',
    body: JSON.stringify({ email, newPassword }),
  });
};

// 13. 회원 탈퇴 (DELETE)
export const withdrawAPI = (password) => {
  return FetchClient('/api/v1/auth/withdraw', {
    method: 'DELETE',
    body: JSON.stringify({ password }),
  });
};

// 14. 아이디 찾기 (GET)
export const findIdAPI = (name, email) => {
  return FetchClient(`/api/v1/auth/findId?name=${name}&email=${email}`, {
    method: 'GET',
  });
};
