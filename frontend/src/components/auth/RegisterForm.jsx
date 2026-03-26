import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputGroup from '@/components/input/InputGroup.jsx';
import ActionInputGroup from '@/components/input/ActionInputGroup.jsx';
import SubmitGuide from '@/components/input/SubmitGuide.jsx';
import Button from '@/components/modal/Button.jsx';
import { TERMS_DATA } from '@/data/termsData.js';
import TermsModal from '@/components/auth/TermsModal.jsx';
import { sendEmailAPI, verifyEmailAPI, registerAPI, checkEmailAPI, checkIdAPI, checkNicknameAPI } from '@/api/Auth.js';
import './RegisterForm.css';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
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
    isNickNameChecked: false,
    isEmailSent: false,
    isEmailVerified: false,
  });

  const validate = (name, value) => {
    let error = '';
    if (name === 'userId') {
      const idRegex = /^[a-z0-9]{4,20}$/;
      if (!idRegex.test(value)) error = '4~20자의 영문 소문자, 숫자만 가능합니다.';
      setStatus((prev) => ({ ...prev, isIdChecked: false }));
    }
    if (name === 'nickname') {
      const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;
      if (!nickRegex.test(value)) {
        error = '2~12자의 한글, 영문, 숫자만 가능합니다.';
      }
      setStatus((prev) => ({ ...prev, isNickNameChecked: false }));
    }
    if (name === 'password') {
      // 영문, 숫자, 특수문자가 각각 1개 이상 포함된 8~20자
      const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      if (!pwRegex.test(value)) {
        error = '8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.';
      }
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) error = '비밀번호가 일치하지 않습니다.';
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

  const isFormValid =
    status.isIdChecked &&
    status.isNickNameChecked &&
    status.isEmailVerified &&
    !Object.values(errors).some((e) => e) &&
    formData.nickname &&
    formData.name &&
    agreements.service &&
    agreements.privacy;

  const getSubmitGuideMessage = () => {
    if (isFormValid) return null;
    if (!status.isIdChecked) return '아이디 중복 확인이 필요합니다.';
    if (!formData.name) return '이름을 입력해주세요.';
    if (!formData.nickname || errors.nickname) return '올바른 닉네임을 입력해주세요.';
    if (!status.isEmailVerified) return '이메일 인증을 완료해주세요.';
    if (!agreements.service || !agreements.privacy) return '필수 약관에 동의해주세요.';
    if (Object.values(errors).some((e) => e)) return '입력 형식을 다시 확인해주세요.';

    return '모든 항목을 정확히 입력해주세요.';
  };
  const guideMessage = getSubmitGuideMessage();

  const handleIdCheck = async () => {
    if (errors.userId || !formData.userId) return alert('유효한 아이디를 입력해주세요.');
    try {
      await checkIdAPI(formData.userId);
      alert('사용 가능한 아이디입니다.');
      setStatus((prev) => ({ ...prev, isIdChecked: true }));
    } catch (e) {
      alert(e.message || '이미 사용 중인 아이디입니다.');
    }
  };

  const handleNickNameCheck = async () => {
    if (errors.nickname || !formData.nickname) return alert('유효한 닉네임을 입력해주세요.');

    try {
      await checkNicknameAPI(formData.nickname);
      alert('사용 가능한 닉네임입니다.');
      setStatus((prev) => ({ ...prev, isNickNameChecked: true }));
    } catch (e) {
      alert(e.message || '이미 사용 중인 닉네임입니다.');
      setStatus((prev) => ({ ...prev, isNickNameChecked: false }));
    }
  };

  const handleEmailCheckAndSend = async () => {
    if (errors.email || !formData.email) return alert('유효한 이메일을 입력해주세요.');
    try {
      await checkEmailAPI(formData.email);
      await sendEmailAPI(formData.email, 'SIGNUP');

      setStatus((prev) => ({ ...prev, isEmailSent: true }));
      alert('인증번호 발송!');
    } catch (e) {
      alert(e.message || '이메일 처리 중 오류 발생');
    }
  };

  const handleVerifyCode = async () => {
    if (!formData.authCode) return alert('인증번호를 입력해주세요.');

    try {
      await verifyEmailAPI(formData.email, formData.authCode, 'SIGNUP');
      alert('인증에 성공했습니다.');
      setStatus((prev) => ({ ...prev, isEmailVerified: true }));
    } catch (e) {
      alert(e.message || '인증번호가 일치하지 않습니다.');
      setStatus((prev) => ({ ...prev, isEmailVerified: false }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { userId, name, email, password, nickname } = formData;
      await registerAPI({ userId, name, email, password, nickname });

      alert('회원가입이 완료되었습니다!');
      navigate('/login'); // 이동할 화면: 메인 화면으로 이동하고 싶으면 '/'로 작성
    } catch (e) {
      alert(e.message || '가입 실패');
    }
  };

  // 필수 항목 표시를 위한 공통 컴포넌트
  const RequiredLabel = ({ text }) => (
    <span>
      {text} <span className="required-asterisk">*</span>
    </span>
  );

  return (
    <div className="register-container">
      <form className="register-content" onSubmit={handleSignup}>
        <h3>회원가입</h3>

        <ActionInputGroup
          label={<RequiredLabel text="아이디" />}
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          btnText="중복확인"
          onAction={handleIdCheck}
          error={errors.userId}
          successMsg={status.isIdChecked && '사용 가능한 아이디입니다.'}
        />
        <InputGroup label={<RequiredLabel text="이름(실명)" />} name="name" value={formData.name} onChange={handleChange} error={errors.name} />
        <InputGroup
          label={<RequiredLabel text="비밀번호" />}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <InputGroup
          label={<RequiredLabel text="비밀번호 확인" />}
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <ActionInputGroup
          label={<RequiredLabel text="닉네임" />}
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          btnText="중복확인"
          onAction={handleNickNameCheck}
          error={errors.nickname}
          placeholder="2~12자의 한글, 영문, 숫자"
          successMsg={status.isNickNameChecked && '사용 가능한 닉네임입니다.'}
        />

        <ActionInputGroup
          label={<RequiredLabel text="이메일" />}
          name="email"
          value={formData.email}
          onChange={handleChange}
          btnText={status.isEmailSent ? '재발송' : '인증요청'}
          onAction={handleEmailCheckAndSend}
          error={errors.email}
          disabled={status.isEmailVerified}
          buttonDisabled={status.isEmailVerified}
        />

        {status.isEmailSent && (
          <ActionInputGroup
            label={<RequiredLabel text="인증번호" />}
            placeholder="인증번호 6자리"
            name="authCode"
            value={formData.authCode}
            onChange={handleChange}
            btnText="확인"
            onAction={handleVerifyCode}
            disabled={status.isEmailVerified}
            buttonDisabled={status.isEmailVerified}
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
              <label htmlFor={type}>
                <span className="required-asterisk">*</span>(필수) {type === 'service' ? '이용약관 동의' : '개인정보 처리방침 동의'}
              </label>
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

        <div className="submit-area" style={{ marginTop: '20px', textAlign: 'center' }}>
          <SubmitGuide message={guideMessage} />
          <Button type="submit" className="register-submit-button" variant="primary" size="lg" disabled={!isFormValid}>
            가입하기
          </Button>
        </div>
      </form>
      <TermsModal isOpen={modal.isOpen} title={modal.title} content={modal.content} onClose={() => setModal({ ...modal, isOpen: false })} />
    </div>
  );
};

export default RegisterForm;
