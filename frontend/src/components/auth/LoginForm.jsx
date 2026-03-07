import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Map, MapPin, MessageCircle, User } from 'lucide-react';
import './LoginForm.css';

const FEATURE_CHIPS = [
  { icon: Map, label: '🗺️ 루트 제작' },
  { icon: MapPin, label: '📍 장소 저장' },
  { icon: MessageCircle, label: '💬 커뮤니티' },
];

const INITIAL_LOGIN_DATA = { userId: '', password: '' };
const MAX_LOGIN_ATTEMPTS = 5;

const LoginInput = ({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  disabled,
  error,
  helperText,
  onChange,
  icon,
  rightAction,
}) => {
  return (
    <div className="login-field">
      <label htmlFor={id} className="login-field-label">
        {label}
      </label>
      <div className={`login-input-wrapper ${error ? 'is-error' : ''}`}>
        {icon ? <span className="login-input-icon">{icon}</span> : null}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
          className={`login-input ${icon ? 'with-icon' : ''} ${rightAction ? 'with-action' : ''}`}
        />
        {rightAction ? <span className="login-input-action">{rightAction}</span> : null}
      </div>
      {helperText ? <p className="login-helper-text">{helperText}</p> : null}
    </div>
  );
};

const LoginForm = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState(INITIAL_LOGIN_DATA);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const isLocked = loginAttempts >= MAX_LOGIN_ATTEMPTS;
  const isSubmitDisabled = isSubmitting || isLocked || !loginData.userId || !loginData.password;

  const handleFieldChange = (key) => (event) => {
    const { value } = event.target;
    setLoginData((prev) => ({ ...prev, [key]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        setLoginAttempts((prev) => prev + 1);
        setErrorMessage('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
      }

      const data = await response.json();
      const accessToken = data.token ?? data.accessToken;
      const storage = rememberMe ? localStorage : sessionStorage;
      if (accessToken) {
        storage.setItem('accessToken', accessToken);
      }

      navigate('/');
    } catch (error) {
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.');
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
            {FEATURE_CHIPS.map(({ label }) => (
              <span key={label} className="feature-chip">
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
          <LoginInput
            id="login-userid"
            label="아이디 또는 이메일"
            value={loginData.userId}
            placeholder="user_id 또는 email 입력"
            disabled={isLocked}
            error={Boolean(errorMessage && !loginData.userId)}
            onChange={handleFieldChange('userId')}
            icon={<User size={18} />}
          />

          <LoginInput
            id="login-password"
            label="비밀번호"
            type={showPassword ? 'text' : 'password'}
            value={loginData.password}
            placeholder="••••••••"
            disabled={isLocked}
            error={Boolean(errorMessage && !loginData.password)}
            helperText="8자 이상, 영문/숫자/특수문자 포함"
            onChange={handleFieldChange('password')}
            rightAction={
              <button
                type="button"
                className="toggle-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

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
              <span className="divider">/</span>
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
