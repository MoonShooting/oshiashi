import React from 'react';
import { Link } from 'react-router-dom';
import './LoginForm.css'; // 전역 스타일 외에 로그인 전용 스타일

const LoginForm = () => {
  return (
    <div className="login-container">
      {/* 좌측 이미지 섹션 */}
      <div className="login-image-side">
        <div className="image-overlay">
          <h2>다시, 덕질을 이어가요</h2>
          <p>推し足에서 나만의 성지순례 루트를 만들고 공유하세요.</p>
          <div className="image-tags">
            <span># 루트 제작</span>
            <span># 장소 저장</span>
            <span># 커뮤니티</span>
          </div>
        </div>
      </div>

      {/* 우측 입력 폼 섹션 */}
      <div className="login-form-side">
        <h3>로그인</h3>
        <p className="subtitle">서비스 이용을 위해 로그인이 필요합니다.</p>

        <form className="auth-form">
          <div className="input-group">
            <label>아이디 또는 이메일</label>
            <input type="text" placeholder="user_id 또는 email 입력" />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input type="password" placeholder="••••••••" />
          </div>

          <div className="form-options">
            <label>
              <input type="checkbox" /> 로그인 유지
            </label>
            <div className="find-links">
              <span>아이디 찾기</span> | <span>비밀번호 찾기</span>
            </div>
          </div>

          <button type="submit" className="btn-login">
            로그인
          </button>
        </form>

        <p className="register-hint">
          아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
