import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputGroup from '@/components/input/InputGroup';
import ActionInputGroup from '@/components/input/ActionInputGroup';
import Button from '@/components/modal/Button.jsx';
import { sendEmailAPI, verifyEmailAPI, findIdAPI } from '@/api/auth.js';

/** 아이디 찾기 로직: 이름, 이메일 인증, 아이디 결과 출력
 * @returns userId
 */
const FindIdForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', authCode: '' });
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 1. 인증번호 발송
  const handleSendEmail = async () => {
    try {
      await sendEmailAPI(formData.email);
      alert('인증번호가 발송되었습니다.');
      setIsEmailSent(true);
    } catch (err) {
      alert(err.message);
    }
  };

  // 2. 인증번호 검증 (서버 통신 추가)
  const handleVerifyCode = async () => {
    try {
      await verifyEmailAPI(formData.email, formData.authCode);
      alert('인증 성공!');
      setIsEmailVerified(true);
    } catch (err) {
      alert('인증번호가 틀립니다.');
    }
  };

  // 3. 최종 아이디 찾기
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. 이름과 이메일 입력 여부 확인
    if (!formData.name || !formData.email) {
      return alert('이름과 이메일을 모두 입력해주세요.');
    }

    // 2. 이메일 인증 완료 여부 확인 (프론트엔드 가드)
    if (!isEmailVerified) {
      return alert('이메일 인증을 먼저 완료해주세요.');
    }

    try {
      // 3. API 요청 (name, email 전달)
      const result = await findIdAPI(formData.name, formData.email);

      // 4. 결과 출력
      if (result && result.userId) {
        alert(`찾으시는 아이디는 [ ${result.userId} ] 입니다.`);
        navigate('/login');
      } else {
        throw new Error('아이디 정보를 응답받지 못했습니다.');
      }
    } catch (error) {
      // 5. 에러 처리 (인증 미완료 시 백엔드 ExceptionHandler가 던지는 메시지 출력)
      alert(error.message || '정보가 일치하는 회원이 없습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup label="이름" name="name" value={formData.name} onChange={handleChange} placeholder="실명 입력" />
      <ActionInputGroup
        label="이메일"
        name="email"
        value={formData.email}
        onChange={handleChange}
        btnText={isEmailSent ? '재발송' : '인증요청'}
        onAction={handleSendEmail}
        disabled={isEmailVerified}
      />
      {isEmailSent && (
        <ActionInputGroup
          label="인증번호"
          name="authCode"
          value={formData.authCode}
          onChange={handleChange}
          btnText="확인"
          onAction={handleVerifyCode}
          disabled={isEmailVerified}
          successMsg={isEmailVerified && '인증 성공!'}
        />
      )}
      <Button type="submit" variant="primary" fullWidth disabled={!formData.name || !isEmailVerified} style={{ marginTop: '20px' }}>
        아이디 찾기
      </Button>
    </form>
  );
};

export default FindIdForm;
