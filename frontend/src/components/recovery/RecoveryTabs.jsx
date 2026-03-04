import React from "react";

function RecoveryTabs({ activeTab, onChangeTab }) {
  return (
    <div className="recovery-tabs">
      <button className={activeTab === "id" ? "active" : ""} onClick={() => onChangeTab("id")}>
        아이디 찾기
      </button>
      <button className={activeTab === "password" ? "active" : ""} onClick={() => onChangeTab("password")}>
        비밀번호 재설정
      </button>
    </div>
  );
}

export default RecoveryTabs;
