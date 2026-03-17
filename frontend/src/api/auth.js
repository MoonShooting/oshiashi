import { FetchClient } from './FetchClient.js';

//FetchClient.js에서 설정한 것이 있기 때문에 여기선 양식에 맞추어 엔드포인트, 타입들만 쓰면 됩니다.
// 1. 이메일 전송 API
export const sendEmailAPI = (email) => {
  return FetchClient('/api/v1/auth/emailSend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// 2. 이메일 검증 API
export const verifyEmailAPI = (email, code) => {
  return FetchClient('/api/v1/auth/emailVerify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
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
export const loginAPI = (loginData) => {
  // loginData = { userId, password }
  return FetchClient('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });
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
