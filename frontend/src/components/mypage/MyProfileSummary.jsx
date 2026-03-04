import React from "react";

function MyProfileSummary({ statCards }) {
  return (
    <section className="my-profile-card">
      <div className="my-profile-left">
        <div className="my-profile-avatar">👤</div>
        <div className="my-profile-meta">
          <div className="my-profile-topline">
            <h2>오시러버</h2>
            <span className="badge-normal">일반</span>
            <span className="badge-active">활성</span>
          </div>
          <p>ID: USR_20240115_ABC123</p>
          <p>Email: oshi***@gmail.com</p>
          <p>가입일: 2024-01-15</p>
          <p>마지막 로그인: 2026-02-26 14:30</p>
          <div className="my-profile-actions">
            <button className="my-edit-btn">프로필 편집</button>
            <button className="my-setting-btn">설정</button>
          </div>
        </div>
      </div>

      <div className="my-stats-grid">
        {statCards.map((card) => (
          <article key={card.label} className="my-stat-item">
            <div className="my-stat-head">
              <span>{card.label}</span>
              <b>{card.icon}</b>
            </div>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MyProfileSummary;
