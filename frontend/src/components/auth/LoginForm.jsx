import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputGroup from '@/components/input/InputGroup.jsx';
import { loginAPI } from '@/api/auth.js';
import { useAuthStore } from '@/stores/useAuthStore.js';
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

  // 구조 분해 할당으로 깔끔하게 가져오기
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // fetchClient가 에러 발생 시 알아서 throw 하므로 성공 케이스에만 집중
      const token = await loginAPI(loginData);

      // 닉네임 정보가 오기 전까지 사용할 임시 데이터
      const tempUser = { userId: loginData.userId };

      // Zustand 스토어 업데이트
      login(tempUser, token);

      // 성공 로직
      navigate('/');
    } catch (error) {
      console.error('로그인 에러:', error);
      // fetchClient에서 throw한 new Error(errorMsg)의 메시지가 출력됩니다.
      alert(error.message || '아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="login-container">
      <div className="login-image-side">
        <div className="image-overlay">
          <h2>다시, 덕질을 이어가요</h2>
          <p>推し足에서 나만의 성지순례 루트를 만들고 공유하세요.</p>
          <div className="image-tags">
            <span># 루트 제작</span> <span># 장소 저장</span> <span># 커뮤니티</span>
          </div>
        </div>
      </div>

      {/* 우측 입력 폼 섹션 */}
      <div className="login-form-side">
        <h3>로그인</h3>
        <p className="subtitle">서비스 이용을 위해 로그인이 필요합니다.</p>

        <form className="auth-form" onSubmit={handleLogin}>
          <InputGroup label="아이디" name="userId" value={loginData.userId} onChange={handleChange} placeholder="user_id 또는 email 입력" />
          <InputGroup label="비밀번호" type="password" name="password" value={loginData.password} onChange={handleChange} placeholder="••••••••" />

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> 로그인 유지
            </label>
            <div className="find-links">
              {/* state에 tab 정보를 담아서 보냅니다 */}
              <Link to="/find-auth" state={{ activeTab: 'id' }}>
                아이디 찾기
              </Link>
              <span className="divider"> | </span>
              <Link to="/find-auth" state={{ activeTab: 'pw' }}>
                비밀번호 찾기
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={!loginData.userId || !loginData.password}>
            로그인
          </button>
        </form>

        <p className="register-hint">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
