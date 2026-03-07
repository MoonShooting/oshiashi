import React, { useState } from 'react';
import InputGroup from '../common/InputGroup';
import ActionInputGroup from '../common/ActionInputGroup';
import SubmitGuide from '../common/SubmitGuide';
import { TERMS_DATA } from '../../data/termsData';
import TermsModal from './TermsModal';
import './RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
    authCode: '',
  });

  const [errors, setErrors] = useState({});
  const [agreements, setAgreements] = useState({ service: false, privacy: false });
  const [modal, setModal] = useState({ isOpen: false, title: '', content: '' });

  const [status, setStatus] = useState({
    isIdChecked: false,
    isEmailSent: false,
    isEmailVerified: false,
  });

  const validate = (name, value) => {
    let error = '';
    if (name === 'userId') {
      const idRegex = /^[a-z0-9]{4,20}$/;
      if (!idRegex.test(value)) error = '4~20자의 영문 소문자, 숫자만 가능합니다.';
      setStatus((prev) => ({ ...prev, isIdChecked: false })); // 아이디 수정 시 중복체크 초기화
    }
    if (name === 'password') {
      if (value.length < 8 || value.length > 20) error = '8~20자로 입력해주세요.';
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) error = '비밀번호가 일치하지 않습니다.';
    }
    if (name === 'nickname') {
      const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;
      if (!nickRegex.test(value)) error = '2~12자의 한글, 영문, 숫자만 가능합니다.';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = '올바른 이메일 형식이 아닙니다.';
      setStatus((prev) => ({ ...prev, isEmailSent: false, isEmailVerified: false }));
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  //최종 버튼 활성화 조건
  const isFormValid =
    status.isIdChecked &&
    status.isEmailVerified &&
    !Object.values(errors).some((e) => e) &&
    formData.nickname &&
    agreements.service &&
    agreements.privacy;

  // --- 버튼 활성화를 위한 동적 안내 메시지 생성 ---
  const getSubmitGuideMessage = () => {
    if (isFormValid) return null; // 모든 조건 충족 시 메시지 없음
    if (!status.isIdChecked) return '아이디 중복 확인이 필요합니다.';
    if (!formData.nickname || errors.nickname) return '올바른 닉네임을 입력해주세요.';
    if (!status.isEmailVerified) return '이메일 인증을 완료해주세요.';
    if (!agreements.service || !agreements.privacy) return '필수 약관에 동의해주세요.';
    if (Object.values(errors).some((e) => e)) return '입력 형식을 다시 확인해주세요.';

    return '모든 항목을 정확히 입력해주세요.';
  };
  const guideMessage = getSubmitGuideMessage();

  // ----- API 연동 -----
  const handleIdCheck = async () => {
    if (errors.userId || !formData.userId) return alert('유효한 아이디를 입력해주세요.');
    try {
      const res = await fetch(`/api/v1/auth/checkId?userId=${formData.userId}`); // 명세 기반
      if (res.ok) {
        alert('사용 가능한 아이디입니다.');
        setStatus((prev) => ({ ...prev, isIdChecked: true }));
      } else {
        alert('이미 사용 중인 아이디입니다.');
      }
    } catch (e) {
      alert('아이디 확인 중 오류 발생');
    }
  };

  const handleEmailCheckAndSend = async () => {
    if (errors.email || !formData.email) return alert('유효한 이메일을 입력해주세요.');
    try {
      const check = await fetch(`/api/v1/auth/checkEmail?email=${formData.email}`);
      if (!check.ok) return alert('이미 가입된 이메일입니다.');

      const send = await fetch('/api/v1/auth/emailSend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (send.ok) {
        setStatus((prev) => ({ ...prev, isEmailSent: true }));
        alert('인증번호 발송!');
      }
    } catch (e) {
      alert('이메일 처리 중 오류 발생');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const res = await fetch('/api/v1/auth/emailVerify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: formData.authCode }),
      });
      if (res.ok) {
        alert('인증에 성공했습니다.');
        setStatus((prev) => ({ ...prev, isEmailVerified: true }));
      } else {
        alert('인증번호가 일치하지 않습니다.');
      }
    } catch (e) {
      alert('인증 확인 중 오류 발생');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('회원가입이 완료되었습니다!');
      } else {
        alert('가입에 실패했습니다.');
      }
    } catch (e) {
      alert('서버 통신 오류');
    }
  };

  return (
    <div className="register-container">
      <form className="register-content" onSubmit={handleSignup}>
        <h3>회원가입</h3>
        <p className="register-subtitle">필수 정보를 입력하고 이메일 인증을 완료하세요.</p>
        <div className="register-stepper" aria-label="회원가입 단계">
          <span className="step-chip active">1. 기본정보</span>
          <span className="step-connector" />
          <span className="step-chip">2. 이메일 인증</span>
          <span className="step-connector" />
          <span className="step-chip">3. 완료</span>
        </div>

        {/* 1. 아이디 중복체크 버튼 있음 */}
        <ActionInputGroup
          label="아이디"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          btnText="중복확인"
          onAction={handleIdCheck}
          error={errors.userId}
          successMsg={status.isIdChecked && '사용 가능한 아이디입니다.'}
        />

        <InputGroup label="비밀번호" type="password" name="password" value={formData.password} onChange={handleChange} error={errors.password} />
        <InputGroup
          label="비밀번호 확인"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        {/* 2. 닉네임 버튼 없음 (유효성 검사만 진행) */}
        <InputGroup
          label="닉네임"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          error={errors.nickname}
          placeholder="2~12자의 한글, 영문, 숫자"
        />

        <ActionInputGroup
          label="이메일"
          name="email"
          value={formData.email}
          onChange={handleChange}
          btnText={status.isEmailSent ? '재발송' : '인증요청'}
          onAction={handleEmailCheckAndSend}
          error={errors.email}
          disabled={status.isEmailVerified}
        />

        {status.isEmailSent && (
          <ActionInputGroup
            placeholder="인증번호 6자리"
            name="authCode"
            value={formData.authCode}
            onChange={handleChange}
            btnText="확인"
            onAction={handleVerifyCode}
            disabled={status.isEmailVerified}
            successMsg={status.isEmailVerified && '인증 성공'}
          />
        )}

        <div className="agreement-section">
          <div className="check-item all-check">
            <input
              type="checkbox"
              checked={agreements.service && agreements.privacy}
              onChange={(e) => {
                const checked = e.target.checked;
                setAgreements({ service: checked, privacy: checked });
              }}
              id="all"
            />
            <label htmlFor="all">전체 동의</label>
          </div>
          <hr />
          {['service', 'privacy'].map((type) => (
            <div className="check-item" key={type}>
              <input
                type="checkbox"
                checked={agreements[type]}
                onChange={() => setAgreements((prev) => ({ ...prev, [type]: !prev[type] }))}
                id={type}
              />
              <label htmlFor={type}>(필수) {type === 'service' ? '이용약관 동의' : '개인정보 처리방침 동의'}</label>
              <button
                type="button"
                className="btn-view"
                onClick={() => {
                  const title = type === 'service' ? '이용약관' : '개인정보 처리방침';
                  const content = type === 'service' ? TERMS_DATA.serviceTerms : TERMS_DATA.privacyPolicy;
                  setModal({ isOpen: true, title, content });
                }}>
                보기
              </button>
            </div>
          ))}
        </div>

        {/* 가이드 메시지 및 버튼 영역 */}
        <div className="submit-area" style={{ marginTop: '20px', textAlign: 'center' }}>
          <SubmitGuide message={guideMessage} />
          <button type="submit" className="btn-submit" disabled={!isFormValid}>
            가입하기
          </button>
        </div>
      </form>
      <TermsModal isOpen={modal.isOpen} title={modal.title} content={modal.content} onClose={() => setModal({ ...modal, isOpen: false })} />
    </div>
  );
};

export default RegisterForm;
