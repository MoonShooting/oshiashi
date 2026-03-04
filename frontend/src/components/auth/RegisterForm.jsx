import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    nickname: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  // 유효성 검사 로직
  const validate = (name, value) => {
    let error = '';
    if (name === 'userId') {
      const idRegex = /^[a-z0-9]{4,20}$/;
      if (!idRegex.test(value))
        error =
          '4~20자의 영문 소문자, 숫자만 사용 가능합니다. (특수문자/공백 불가)';
    }
    if (name === 'password') {
      if (value.length < 8 || value.length > 20)
        error = '8~20자로 입력해주세요.';
    }
    if (name === 'nickname') {
      const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;
      if (!nickRegex.test(value))
        error = '2~12자의 한글, 영문, 숫자만 사용 가능합니다.';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  return (
    <div className="register-container">
      {/* 상단 스텝 바 (생략) */}

      <div className="register-content">
        {step === 1 && (
          <div className="step-form">
            <h3>기본 정보 입력</h3>

            {/* ID 필드 */}
            <div className="input-group">
              <label>아이디</label>
              <div className="input-row">
                <input
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  placeholder="영문 소문자, 숫자 4~20자"
                />
                <button className="btn-check">중복확인</button>
              </div>
              {errors.userId && (
                <span className="error-msg">{errors.userId}</span>
              )}
            </div>

            {/* PW 필드 */}
            <div className="input-group">
              <label>비밀번호</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="8~20자 입력"
              />
              {errors.password && (
                <span className="error-msg">{errors.password}</span>
              )}
            </div>

            {/* 닉네임 필드 */}
            <div className="input-group">
              <label>닉네임</label>
              <input
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="한글, 영문, 숫자 2~12자"
              />
              {errors.nickname && (
                <span className="error-msg">{errors.nickname}</span>
              )}
            </div>

            <button
              className="btn-next"
              disabled={
                Object.values(errors).some((e) => e !== '') || !formData.userId
              }
              onClick={() => setStep(2)}
            >
              다음 단계로
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-verify">
            <h3>이메일 인증</h3>
            <p>입력하신 이메일로 6자리 인증코드가 전송되었습니다.</p>

            <div className="input-group">
              <label>인증코드</label>
              <div className="input-row">
                <input
                  type="text"
                  placeholder="6자리 코드 입력"
                  maxLength={6}
                />
                <button className="btn-check">확인</button>
              </div>
            </div>

            <button className="btn-next" onClick={() => setStep(3)}>
              인증 완료
            </button>
            <button className="btn-prev" onClick={() => setStep(1)}>
              이전으로
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
