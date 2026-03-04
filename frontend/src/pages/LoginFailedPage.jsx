import React, { useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";

function LoginFailedPage({ onRetryLogin, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="login-complete-page login-failed-page">
      <SharedHeader onMenuClick={() => setMenuOpen((prev) => !prev)} showSearch={false} helpText="도움말" />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey=""
        onNavigate={onNavigate}
      />

      <main className="login-complete-main">
        <section className="login-complete-card">
          <div className="login-complete-icon-wrap login-failed-icon-wrap" aria-hidden>
            <span>!</span>
          </div>
          <h2>로그인 실패</h2>
          <p>아이디 또는 비밀번호를 확인해주세요.</p>
          <p>다시 입력 후 로그인해 주세요.</p>
          <button className="login-complete-button" onClick={onRetryLogin}>
            로그인 화면으로 돌아가기
          </button>
        </section>
      </main>
    </div>
  );
}

export default LoginFailedPage;
