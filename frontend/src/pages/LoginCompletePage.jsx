import React, { useState } from "react";
import SharedSidebar from "../components/SharedSidebar";
import SharedHeader from "../components/SharedHeader";

function LoginCompletePage({ onGoLogin, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="login-complete-page">
      <SharedHeader onMenuClick={() => setMenuOpen((prev) => !prev)} showSearch={false} helpText="도움말" />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey=""
        onNavigate={onNavigate}
      />

      <main className="login-complete-main">
        <section className="login-complete-card">
          <div className="login-complete-icon-wrap" aria-hidden>
            <span>✓</span>
          </div>
          <h2>로그인 완료!</h2>
          <p>推し足에 오신 것을 환영합니다.</p>
          <p>이제 성지순례 루트를 만들어보세요!</p>
          <button className="login-complete-button" onClick={onGoLogin}>
            로그인 화면으로 돌아가기
          </button>
        </section>
      </main>
    </div>
  );
}

export default LoginCompletePage;
