import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputGroup from '@/components/input/InputGroup';
import ActionInputGroup from '@/components/input/ActionInputGroup';
import Button from '@/components/modal/Button.jsx';
import { passwordResetEmailAPI, verifyEmailAPI, passwordResetConfirmAPI } from '@/api/auth.js';

/** 비밀번호 재설정 컴포넌트
 * @returns
 */
const ResetPwForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    authCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 비밀번호 재설정용 인증 메일 발송 (11번 API)
  const handleSendResetEmail = async () => {
    if (!formData.email) return alert('이메일을 입력해주세요.');
    try {
      await passwordResetEmailAPI(formData.email, formData.authCode);
      alert('비밀번호 재설정 인증번호가 발송되었습니다.');
      setIsEmailSent(true);
    } catch (error) {
      alert(error.message || '존재하지 않는 계정이거나 발송 실패입니다.');
    }
  };

  // 인증번호 검증 (2번 API 활용)
  const handleVerifyCode = async () => {
    if (!formData.authCode) return alert('인증번호를 입력해주세요.');
    try {
      // 서버에서 이메일과 코드를 대조하여 인증 상태를 완료 처리함
      await verifyEmailAPI(formData.email, formData.authCode, 'FIND_PW');
      alert('인증에 성공했습니다.');
      setIsEmailVerified(true);
    } catch (error) {
      alert(error.message || '인증번호가 일치하지 않습니다.');
    }
  };

  // 비밀번호 재설정 완료 제출 (12번 API)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      return alert('비밀번호가 일치하지 않습니다.');
    }

    try {
      // API 명세에 맞게 email과 newPassword 전달
      await passwordResetConfirmAPI(formData.email, formData.newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
      navigate('/login');
    } catch (error) {
      alert(error.message || '비밀번호 재설정에 실패했습니다.');
    }
  };

  // 버튼 활성화 조건
  const isFormValid = formData.userId && isEmailVerified && formData.newPassword && formData.newPassword === formData.confirmPassword;

  return (
    <form onSubmit={handleSubmit}>
      {/* 아이디 입력 */}
      <InputGroup label="아이디" name="userId" value={formData.userId} onChange={handleChange} placeholder="아이디 입력" />

      {/* 이메일 인증 */}
      <ActionInputGroup
        label="이메일"
        name="email"
        value={formData.email}
        onChange={handleChange}
        btnText={isEmailSent ? '재발송' : '인증요청'}
        onAction={handleSendResetEmail}
        disabled={isEmailVerified}
      />

      {/* 인증번호 입력 (발송 성공 시 노출) */}
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

      {/* 새 비밀번호 입력 */}
      <InputGroup
        label="새 비밀번호"
        type="password"
        name="newPassword"
        value={formData.newPassword}
        onChange={handleChange}
        placeholder="8자 이상 입력"
      />
      <InputGroup
        label="비밀번호 확인"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="비밀번호 다시 입력"
      />

      <div className="submit-area" style={{ paddingTop: '30px' }}>
        <Button type="submit" variant="primary" size="md" fullWidth disabled={!isFormValid}>
          비밀번호 재설정 완료
        </Button>
      </div>
    </form>
  );
};

export default ResetPwForm;
