import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputGroup from '../common/InputGroup'; // 아까 만든 공통 컴포넌트
import './LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // 로그인 제출 이벤트 (Fetch API)
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const data = await response.json(); // JWT 토큰이 들어있다고 가정
        localStorage.setItem('accessToken', data.token); // 토큰 저장
        alert('환영합니다!');
        navigate('/'); // 메인으로 이동
      } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      {/* 좌측 이미지 섹션 (동일) */}
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
          {/* 공통 컴포넌트 적용 - 속성을 가로로 나열해도 정렬이 유지됩니다! */}
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
          아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
