import React, { useState } from "react";
import SharedHeader from "../components/SharedHeader";
import SharedSidebar from "../components/SharedSidebar";
import RecoveryTabs from "../components/recovery/RecoveryTabs";
import FindIdSection from "../components/recovery/FindIdSection";
import PasswordResetSection from "../components/recovery/PasswordResetSection";

function AccountRecoveryPage({ onGoLogin, onNavigate, initialTab = "id" }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="recovery-page">
      <SharedHeader
        onMenuClick={() => setMenuOpen((prev) => !prev)}
        showSearch={false}
        rightSlot={<button className="app-header-help" onClick={onGoLogin}>로그인으로 돌아가기</button>}
      />

      <SharedSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeKey=""
        onNavigate={onNavigate}
      />

      <main className="recovery-main">
        <section className="recovery-shell">
          <div className="recovery-head">
            <h2>계정 찾기</h2>
            <p>아이디 찾기 또는 비밀번호 재설정을 진행할 수 있습니다</p>
          </div>

          <RecoveryTabs activeTab={activeTab} onChangeTab={setActiveTab} />

          {activeTab === "id" ? <FindIdSection onGoLogin={onGoLogin} /> : <PasswordResetSection onGoLogin={onGoLogin} />}
        </section>
      </main>
    </div>
  );
}

export default AccountRecoveryPage;
