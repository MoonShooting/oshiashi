import React, { useState } from 'react';
import { TERMS_DATA } from '../../data/termsData';
import TermsModal from './TermsModal';
import './RegisterForm.css';

const RegisterForm = () => {
  // 1. 데이터 상태 관리
  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    email: '',
  });

  const [errors, setErrors] = useState({});

  // 2. 필수 체크박스만 관리 (마케팅 삭제)
  const [agreements, setAgreements] = useState({
    service: false,
    privacy: false,
  });

  // 3. 모달 상태 관리
  const [modal, setModal] = useState({ isOpen: false, title: '', content: '' });

  // 유효성 검사 로직
  const validate = (name, value) => {
    let error = '';
    if (name === 'userId') {
      const idRegex = /^[a-z0-9]{4,20}$/;
      if (!idRegex.test(value))
        error = '4~20자의 영문 소문자, 숫자만 가능합니다.';
    }
    if (name === 'password') {
      if (value.length < 8 || value.length > 20)
        error = '8~20자로 입력해주세요.';
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) error = '비밀번호가 일치하지 않습니다.';
    }
    if (name === 'nickname') {
      const nickRegex = /^[a-zA-Z0-9가-힣]{2,12}$/;
      if (!nickRegex.test(value))
        error = '2~12자의 한글, 영문, 숫자만 가능합니다.';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validate(name, value);
  };

  // 체크박스 핸들러
  const handleAllCheck = (e) => {
    const checked = e.target.checked;
    setAgreements({ service: checked, privacy: checked });
  };

  const handleCheck = (name) => {
    setAgreements((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // 모달 제어
  const openModal = (type) => {
    const title = type === 'service' ? '이용약관' : '개인정보 처리방침';
    const content =
      type === 'service' ? TERMS_DATA.serviceTerms : TERMS_DATA.privacyPolicy;
    setModal({ isOpen: true, title, content });
  };

  return (
    <div className="register-container">
      <div className="register-content">
        <h3>회원가입</h3>

        {/* 아이디 필드 */}
        <div className="input-group">
          <label>아이디</label>
          <div className="input-row">
            <input
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              placeholder="영문 소문자, 숫자 4~20자"
            />
            <button type="button" className="btn-check">
              중복확인
            </button>
          </div>
          {errors.userId && <span className="error-msg">{errors.userId}</span>}
        </div>

        {/* 비밀번호 필드 */}
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

        {/* 비밀번호 확인 필드 */}
        <div className="input-group">
          <label>비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="비밀번호 재입력"
          />
          {errors.confirmPassword && (
            <span className="error-msg">{errors.confirmPassword}</span>
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

        {/* 약관 동의 영역 (마케팅 삭제됨) */}
        <div className="agreement-section">
          <div className="check-item all-check">
            <input
              type="checkbox"
              checked={agreements.service && agreements.privacy}
              onChange={handleAllCheck}
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
                onChange={() => handleCheck(type)}
                id={type}
              />
              <label htmlFor={type}>
                (필수){' '}
                {type === 'service'
                  ? '이용약관 동의'
                  : '개인정보 처리방침 동의'}
              </label>
              <button
                type="button"
                className="btn-view"
                onClick={() => openModal(type)}
              >
                보기
              </button>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={
            !agreements.service ||
            !agreements.privacy ||
            Object.values(errors).some((err) => err !== '') ||
            !formData.userId ||
            !formData.password ||
            !formData.nickname
          }
        >
          가입하기
        </button>
      </div>

      <TermsModal
        isOpen={modal.isOpen}
        title={modal.title}
        content={modal.content}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />
    </div>
  );
};

export default RegisterForm;
