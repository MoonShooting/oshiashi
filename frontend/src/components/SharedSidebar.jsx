import React from "react";

const topItems = [
  { key: "home", label: "홈", icon: "⌂" },
  { key: "browse", label: "작품 탐색", icon: "◈" },
  { key: "route-builder", label: "루트 생성", icon: "✎" },
  { key: "community", label: "커뮤니티", icon: "☰" },
  { key: "mypage", label: "마이페이지", icon: "◉" },
];

const bottomItems = [
  { key: "achievements", label: "업적", icon: "★" },
  { key: "settings", label: "설정", icon: "⚙" },
];

function SharedSidebar({ isOpen, onClose, activeKey, onNavigate }) {
  return (
    <>
      <div
        className={isOpen ? "shared-sidebar-backdrop open" : "shared-sidebar-backdrop"}
        onClick={onClose}
      />
      <aside className={isOpen ? "shared-sidebar open" : "shared-sidebar"}>
        <div className="shared-sidebar-main">
          <div className="shared-sidebar-top">
            {topItems.map((item) => (
              <button
                key={item.key}
                className={activeKey === item.key ? "active" : ""}
                onClick={() => {
                  onNavigate?.(item.key);
                  onClose?.();
                }}
              >
                <span className="shared-menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="shared-sidebar-bottom">
            {bottomItems.map((item) => (
              <button key={item.key} onClick={onClose}>
                <span className="shared-menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default SharedSidebar;
