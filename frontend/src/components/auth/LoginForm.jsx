import React, { useState } from 'react';
import { LockKeyhole, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import InputGroup from '@/components/input/InputGroup.jsx';
import Button from '@/components/common/Button.jsx';
import { loginAPI } from '@/api/auth.js';
import { useAuthStore } from '@/stores/useAuthStore.js';
import '@/components/auth/LoginForm.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ userId: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');

  // Zustand 스토어에서는 로그인 성공 후 "사용자 정보 + 토큰 저장 정책"만 반영합니다.
  // 실제 인증 요청은 api 레이어가, 화면 전환은 이 컴포넌트가 담당하도록 역할을 분리합니다.
  const { login } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 사용자가 입력을 수정하며 다시 시도할 수 있도록, 제출 직전 이전 에러를 비웁니다.
    setFormError('');

    try {
      // API 호출: 백엔드에서 토큰과 유저 정보(userInfo)를 같이 준다고 가정
      const { token, userInfo } = await loginAPI(loginData);

      // 상태 관리 스토어 저장: 실제 닉네임 등이 담긴 userInfo와 토큰 저장
      login(userInfo, token, rememberMe);

      // 인증 상태가 반영되면 홈으로 이동합니다.
      navigate('/');
    } catch (error) {
      console.error('로그인 에러:', error);
      setFormError(error.message || '아이디 또는 비밀번호를 확인해주세요.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 공통 InputGroup은 name/value 기반으로 동작하므로,
    // 모든 입력 필드를 동일한 패턴으로 갱신할 수 있습니다.
    setLoginData((prev) => ({ ...prev, [name]: value }));

    // 사용자가 값을 다시 입력하기 시작하면 기존 폼 에러는 지워 UX를 단순하게 유지합니다.
    if (formError) {
      setFormError('');
    }
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
          {/* 공통 InputGroup을 유지하되, 페이지 전용 아이콘/여백은 감싸는 div와 CSS로 해결합니다. */}
          <div className="login-field">
            <span className="login-field-icon" aria-hidden="true">
              <UserRound size={16} />
            </span>
            <InputGroup
              label="아이디"
              name="userId"
              value={loginData.userId}
              onChange={handleChange}
              placeholder="아이디를 입력하세요"
              autoComplete="username"
              inputClassName="login-input"
            />
          </div>

          <div className="login-field">
            <span className="login-field-icon" aria-hidden="true">
              <LockKeyhole size={16} />
            </span>
            <InputGroup
              label="비밀번호"
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              inputClassName="login-input"
            />
          </div>

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

          {formError ? <p className="login-form-error">{formError}</p> : null}

          <Button
            type="submit"
            className="login-submit-button"
            variant="primary"
            size="md"
            fullWidth
            disabled={!loginData.userId || !loginData.password}>
            로그인
          </Button>
        </form>

        <p className="register-hint">
          아직 계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
