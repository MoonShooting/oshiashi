import React from "react";

function MyPageTabs({ tabs, activeTab, onChangeTab }) {
  return (
    <section className="my-tabs">
      {tabs.map((tab) => (
        <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => onChangeTab(tab)}>
          {tab}
        </button>
      ))}
    </section>
  );
}

export default MyPageTabs;
