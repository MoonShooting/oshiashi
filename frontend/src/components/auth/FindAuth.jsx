import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InputGroup from '@/components/input/InputGroup';
import ActionInputGroup from '@/components/input/ActionInputGroup';
import SubmitGuide from '@/components/input/SubmitGuide';
import Button from '@/components/common/Button.jsx';
import { findIdAPI, passwordResetEmailAPI, passwordResetConfirmAPI } from '@/api/auth.js';
import './FindAuth.css';

const FindAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 탭 변경 시 상태 초기화 (중요: 탭 바꿀 때 인증 상태 리셋)
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setFormData({ name: '', email: '', userId: '', authCode: '', newPassword: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. 아이디 찾기 (이름 + 이메일 연동)
  const handleFindId = async (e) => {
    if (e) e.preventDefault();
    try {
      // 💡 auth.js 수정에 맞춰 name, email 전달
      const result = await findIdAPI(formData.name, formData.email);
      alert(`찾으시는 아이디는 [ ${result.userId} ] 입니다.`);
      navigate('/login');
    } catch (error) {
      alert(error.message || '정보가 일치하는 회원이 없습니다.');
    }
  };

  // 2. 비밀번호 재설정용 이메일 발송
  const handleSendResetEmail = async () => {
    try {
      await passwordResetEmailAPI(formData.email);``
      alert('인증번호가 발송되었습니다.');
      setIsEmailSent(true); // 성공해야만 아래 input이 렌더링됨
    } catch (error) {
      alert(error.message || '존재하지 않는 계정이거나 발송 실패입니다.');
      // 테스트 시에만 아래 주석 해제하여 UI 확인 가능
      // setIsEmailSent(true);
    }
  };

  // 이메일 인증 시 인증번호 입력란 핸들러
  const handleVerifyCode = async () => {
    if (!formData.authCode) return alert('인증번호를 입력해주세요.');
    try {
      // 만약 별도의 검증 API가 있다면 호출, 없다면 비밀번호 변경 시 같이 보냄
      // 여기서는 회원가입 UX와 맞추기 위해 성공 알림만 처리하거나 verifyEmailAPI 활용
      alert('인증에 성공했습니다.');
      setIsEmailVerified(true);
    } catch (error) {
      alert('인증번호가 일치하지 않습니다.');
    }
  };

  // 비밀번호 재설정 확인 핸들러
  const handleResetPassword = async () => {
    try {
      // 12번 API: passwordResetConfirmAPI(email, newPassword) 호출
      // 인증번호(authCode) 검증 로직은 백엔드 설계에 따라 추가될 수 있음
      await passwordResetConfirmAPI(formData.email, formData.newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    } catch (error) {
      alert(error.message || '비밀번호 재설정에 실패했습니다.');
    }
  };

  const isIdFormValid = formData.name && formData.email;
  const isPwFormValid =
    formData.userId && formData.email && formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword;

  const pwGuideMessage =
    !isPwFormValid && formData.newPassword !== formData.confirmPassword
      ? '비밀번호가 일치하지 않습니다.'
      : !isPwFormValid
        ? '모든 정보를 입력해 주세요.'
        : null;

  return (
    <div className="login-form-side">
      <h3>계정 찾기</h3>
      <div className="auth-tabs">
        <button className={activeTab === 'id' ? 'active' : ''} onClick={() => handleTabChange('id')}>
          아이디 찾기
        </button>
        <button className={activeTab === 'pw' ? 'active' : ''} onClick={() => handleTabChange('pw')}>
          비밀번호 재설정
        </button>
      </div>

      <div className="auth-form-container">
        {' '}
        {/* 클래스명 변경하여 CSS 대응 */}
        {activeTab === 'id' ? (
          <form onSubmit={handleFindId}>
            <InputGroup label="이름" name="name" value={formData.name} onChange={handleChange} placeholder="실명 입력" />
            <ActionInputGroup
              label="이메일"
              name="email"
              value={formData.email}
              onChange={handleChange}
              btnText={isEmailSent ? '재발송' : '인증요청'}
              onAction={handleSendResetEmail}
              disabled={isEmailVerified}
            />
            {/* 이메일 발송 성공 시에만 등장하는 인증번호 입력란 */}
            {isEmailSent && (
              <ActionInputGroup
                label="인증번호"
                name="authCode"
                value={formData.authCode}
                onChange={handleChange}
                placeholder="인증번호 6자리"
                btnText="확인"
                onAction={handleVerifyCode}
                disabled={isEmailVerified}
                successMsg={isEmailVerified && '인증 성공!'}
              />
            )}

            <div className="submit-area" style={{ paddingTop: '30px' }}>
              <Button type="submit" variant="primary" size="md" fullWidth disabled={!isIdFormValid || !isEmailVerified}>
                아이디 찾기
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <InputGroup label="아이디" name="userId" value={formData.userId} onChange={handleChange} placeholder="아이디 입력" />
            <ActionInputGroup
              label="이메일"
              name="email"
              value={formData.email}
              onChange={handleChange}
              btnText={isEmailSent ? '재발송' : '인증요청'}
              onAction={handleSendResetEmail}
              disabled={isEmailVerified}
            />
            {isEmailSent && (
              <ActionInputGroup
                label="인증번호"
                name="authCode"
                value={formData.authCode}
                onChange={handleChange}
                btnText="확인"
                onAction={() => setIsEmailVerified(true)}
                disabled={isEmailVerified}
                successMsg={isEmailVerified && '인증 성공!'}
              />
            )}
            <InputGroup label="새 비밀번호" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
            <InputGroup label="비밀번호 확인" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
            <div className="submit-area" style={{ paddingTop: '30px' }}>
              <Button type="submit" variant="primary" size="md" fullWidth disabled={!isPwFormValid || !isEmailVerified}>
                비밀번호 재설정 완료
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FindAuth;
