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
      // 로그인 API 호출은 컴포넌트가 직접 fetch하지 않고 공통 api 레이어에 위임합니다.
      const token = await loginAPI(loginData);

      // 닉네임/프로필 조회 API가 아직 분리되지 않았으므로
      // 현재는 userId만 우선 store에 저장해 로그인 상태를 복구합니다.
      const tempUser = { userId: loginData.userId };

      // 로그인 유지 여부에 따라 local/session 저장소를 분기합니다.
      login(tempUser, token, rememberMe);
      setLoginAttempts(0);
      setErrorMessage('');
      navigate('/');
    } catch (error) {
      const nextAttempts = loginAttempts + 1;
      setLoginAttempts(nextAttempts);

      // 실패 횟수가 한도에 도달하면 다음 시도부터는 입력 자체를 잠급니다.
      if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
        setErrorMessage('로그인 시도가 5회 초과되었습니다. 비밀번호 찾기를 이용해 주세요.');
      } else {
        // FetchClient가 던진 서버 메시지를 우선 노출하고,
        // 메시지가 없으면 공통 안내 문구로 대체합니다.
        console.error('로그인 에러:', error);
        setErrorMessage(error.message || '아이디 또는 비밀번호를 확인해주세요.');
      }
    } finally {
      // 버튼 중복 클릭을 막기 위해 제출 상태는 항상 마지막에 해제합니다.
      setIsSubmitting(false);
    }
  };

  const userIdError =
    errorMessage && !loginData.userId ? '아이디 또는 이메일을 입력해주세요.' : '';

  const passwordError =
    errorMessage && !loginData.password ? '비밀번호를 입력해주세요.' : '';

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
              error={userIdError}
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
              error={passwordError}
              inputClassName="login-input with-icon with-action"
            />
          </div>

          {errorMessage && !userIdError && !passwordError ? <p className="login-error-text">{errorMessage}</p> : null}
 
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
