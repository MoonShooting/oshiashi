import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Map, MapPin, MessageCircle, LockKeyhole, User } from 'lucide-react';
import InputGroup from '../common/InputGroup';
import { loginAPI } from '../../api/auth';
import { useAuthStore } from '../../stores/useAuthStore';
import './LoginForm.css';

const FEATURE_CHIPS = [
  { icon: Map, label: '루트 제작' },
  { icon: MapPin, label: '장소 저장' },
  { icon: MessageCircle, label: '커뮤니티' },
];

const INITIAL_LOGIN_DATA = { userId: '', password: '' };
const MAX_LOGIN_ATTEMPTS = 5;

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loginData, setLoginData] = useState(INITIAL_LOGIN_DATA);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const isLocked = loginAttempts >= MAX_LOGIN_ATTEMPTS;
  const isSubmitDisabled = isSubmitting || isLocked || !loginData.userId || !loginData.password;

  // 공통 InputGroup은 name/value 기반으로 동작하므로
  // 폼 상태도 필드명을 그대로 유지해 두면 다른 인증 폼과 흐름을 맞추기 쉽습니다.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await loginAPI(loginData);

      // 로그인 성공 시 전역 인증 상태와 저장소를 동시에 맞춥니다.
      // 이후 Header/Sidebar가 저장소를 읽어도 즉시 같은 결과를 보게 됩니다.
      login({ userId: loginData.userId }, token, rememberMe);
      setLoginAttempts(0);
      setErrorMessage('');
      navigate('/');
    } catch (error) {
      setLoginAttempts((prev) => prev + 1);

      if (isLocked) {
        setErrorMessage('로그인 시도가 제한되었습니다. 비밀번호 찾기를 이용해 주세요.');
        return;
      }

      setErrorMessage(error.message || '서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="login-shell">
      <aside className="login-visual-panel" aria-hidden="true">
        <div className="login-visual-overlay">
          <h2>다시, 덕질을 이어가요</h2>
          <p>推し足에서 성지순례 루트를 만들고 공유하세요.</p>
          <div className="login-feature-chips">
            {FEATURE_CHIPS.map(({ icon: Icon, label }) => (
              <span key={label} className="feature-chip">
                <Icon size={14} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <section className="login-form-panel">
        <header className="login-header">
          <h3>로그인</h3>
          <p>아이디(user_id) 또는 이메일로 로그인</p>
        </header>

        {isLocked ? (
          <div className="login-warning-box">
            로그인 시도가 5회 초과되어 계정이 잠겼습니다. 비밀번호 찾기를 통해 재설정해 주세요.
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="login-field">
            <span className="login-input-icon" aria-hidden="true">
              <User size={18} />
            </span>
            <InputGroup
              id="login-userid"
              label="아이디"
              name="userId"
              value={loginData.userId}
              onChange={handleChange}
              placeholder="user_id 또는 email 입력"
              disabled={isLocked}
              error=""
              inputClassName="login-input with-icon"
            />
          </div>

          <div className="login-field">
            <span className="login-input-icon" aria-hidden="true">
              <LockKeyhole size={18} />
            </span>
            <span className="login-input-action">
              <button
                type="button"
                className="toggle-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isLocked}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
            <InputGroup
              id="login-password"
              label="비밀번호"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLocked}
              error=""
              inputClassName="login-input with-icon with-action"
            />
            <p className="login-helper-text">8자 이상 비밀번호를 입력하세요.</p>
          </div>

          {errorMessage ? <p className="login-error-text">{errorMessage}</p> : null}

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              로그인 유지
            </label>
            <div className="find-links">
              <Link to="/find-auth" state={{ activeTab: 'id' }}>
                아이디 찾기
              </Link>
              <span className="divider">|</span>
              <Link to="/find-auth" state={{ activeTab: 'pw' }}>
                비밀번호 찾기
              </Link>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={isSubmitDisabled}>
            {isSubmitting ? '로그인 중...' : '로그인'}
            {!isSubmitting ? <ArrowRight size={18} /> : null}
          </button>
        </form>

        <p className="register-hint">
          아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </section>
    </section>
  );
};

export default LoginForm;
