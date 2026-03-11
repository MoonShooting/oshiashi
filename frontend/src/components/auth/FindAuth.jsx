import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InputGroup from '../input/InputGroup';
import ActionInputGroup from '../input/ActionInputGroup';
import SubmitGuide from '../input/SubmitGuide';
import './FindAuth.css';

const FindAuth = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 위치 정보를 가져옵니다.
  //넘겨받은 state가 있으면 그 값을, 없으면 기본: 아이디찾기로
  const initialTab = location.state?.activeTab || 'id';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    authCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // 모든 값이 있을 때만 버튼 활성화
  const isIdFormValid = formData.name && formData.email;
  // 모든 값이 있고 + 두 비밀번호가 일치할 때만 버튼 활성화
  const isPwFormValid =
    formData.userId &&
    formData.email &&
    formData.authCode &&
    formData.newPassword &&
    formData.confirmPassword &&
    formData.newPassword === formData.confirmPassword;

  const getPwGuideMessage = () => {
    // 모든 필드가 채워지지 않았을 때
    if (!isPwFormValid) {
      return '모든 정보를 입력해 주세요.';
    }
    // 필드는 다 채웠는데 비밀번호가 서로 다를 때
    if (formData.newPassword !== formData.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }
    // 모든 조건 충족 시
    return null;
  };

  const pwGuideMessage = getPwGuideMessage();

  return (
    <div className="login-form-side">
      <h3>계정 찾기</h3>
      <p className="subtitle">아이디 찾기 또는 비밀번호 재설정을 진행할 수 있습니다.</p>

      <div className="auth-tabs">
        <button className={activeTab === 'id' ? 'active' : ''} onClick={() => setActiveTab('id')}>
          아이디 찾기
        </button>
        <button className={activeTab === 'pw' ? 'active' : ''} onClick={() => setActiveTab('pw')}>
          비밀번호 재설정
        </button>
      </div>

      <div className="auth-form">
        {activeTab === 'id' ? (
          <>
            <InputGroup label="이름" name="name" value={formData.name} onChange={handleChange} placeholder="이름 입력" />
            <InputGroup label="이메일" name="email" value={formData.email} onChange={handleChange} placeholder="가입 시 이메일" />
            <SubmitGuide message={!isIdFormValid && '이름과 이메일을 모두 입력해 주세요.'} />
            <button type="button" className="btn-login" disabled={!isIdFormValid}>
              아이디 찾기
            </button>
          </>
        ) : (
          <>
            <InputGroup label="아이디" name="userId" value={formData.userId} onChange={handleChange} placeholder="아이디 입력" />
            <ActionInputGroup
              label="이메일"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="가입 시 이메일"
              btnText="인증메일 발송"
              onAction={() => alert('메일 발송')}
            />
            <InputGroup label="인증번호" name="authCode" value={formData.authCode} onChange={handleChange} placeholder="인증번호 6자리" />
            <InputGroup
              label="새 비밀번호"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="새 비밀번호 입력"
            />
            <InputGroup
              label="비밀번호 확인"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="비밀번호 재확인"
            />
            <SubmitGuide message={pwGuideMessage} />
            <button
              type="button"
              className="btn-login"
              // 버튼 활성화 조건도 "일치"여부를 포함해야 안전합니다.
              disabled={!isPwFormValid || formData.newPassword !== formData.confirmPassword}>
              비밀번호 변경하기
            </button>
          </>
        )}
      </div>

      <p className="register-hint" style={{ marginTop: '30px' }}>
        <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#71717a', fontSize: '13px' }}>
          로그인으로 돌아가기
        </span>
      </p>
    </div>
  );
};

export default FindAuth;
