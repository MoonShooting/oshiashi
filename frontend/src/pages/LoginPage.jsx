import React, { useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";

const heroImage = "http://localhost:3845/assets/7963a8bb2e6574e656a03a6c25a79f7264e7e5ef.png";

function LoginPage({ onLogin, onGoHome, onNavigate, onGoRecovery }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const canLogin = identifier.trim() && password.trim();

  return (
    <div className="login-page">
      <SharedHeader onMenuClick={() => setMenuOpen((prev) => !prev)} showSearch={false} helpText="도움말" />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey=""
        onNavigate={onNavigate}
      />

      <main className="login-main">
        <section className="login-panel visual-panel">
          <img src={heroImage} alt="anime" />
          <div className="visual-overlay" />
          <div className="visual-copy">
            <h2>다시, 덕질을 이어가요</h2>
            <p>推し足에서 성지순례 루트를 만들고 공유하세요.</p>
            <div className="visual-tags">
              <span>🗺️ 루트 제작</span>
              <span>📍 장소 저장</span>
              <span>💬 커뮤니티</span>
            </div>
          </div>
        </section>

        <section className="login-panel form-panel">
          <div className="form-head">
            <h2>로그인</h2>
            <p>아이디(user_id) 또는 이메일로 로그인</p>
          </div>

          <div className="form-group">
            <label>아이디 또는 이메일</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="user_id 또는 email 입력"
            />
          </div>

          <div className="form-group">
            <label>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <small>8자 이상, 영문/숫자/특수문자 포함</small>
          </div>

          <div className="login-options">
            <label className="checkbox-wrap">
              <input
                type="checkbox"
                checked={keepLogin}
                onChange={(e) => setKeepLogin(e.target.checked)}
              />
              <span>로그인 유지</span>
            </label>
            <div className="find-links">
              <button type="button" onClick={() => onGoRecovery?.("id")}>아이디 찾기</button>
              <span>/</span>
              <button type="button" onClick={() => onGoRecovery?.("password")}>비밀번호 찾기</button>
            </div>
          </div>

          <button
            className={canLogin ? "login-submit active" : "login-submit"}
            disabled={!canLogin}
            onClick={() => onLogin(identifier, password)}
          >
            로그인 →
          </button>

          <div className="divider">
            <span>또는</span>
          </div>

          <button className="google-btn">Google로 계속</button>

          <p className="signup-text">
            아직 계정이 없나요? <button>회원가입</button>
          </p>

          <button className="skip-btn" onClick={onGoHome}>메인으로 건너뛰기</button>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
