import React from 'react';
import styles from '../../styles/Sidebar.module.css';

const LineIcon = ({ name }) => {
  const common = {
    className: styles.iconSvg,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M6 10.5V20h12v-9.5" />
        </svg>
      );
    case 'works':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2.5" />
          <path d="m10 9 5 3-5 3V9Z" />
        </svg>
      );
    case 'route':
      return (
        <svg {...common}>
          <path d="M7 6a2.3 2.3 0 1 1 0 4.6A2.3 2.3 0 0 1 7 6Z" />
          <path d="M17 13.4a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6Z" />
          <path d="M9 8.3h2.2c2.5 0 2.7 2.2 2.7 3.7 0 1.2.3 3 2.8 3H15" />
        </svg>
      );
    case 'community':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="11.5" rx="3" />
          <path d="m9 16.5-2.5 2.5" />
          <path d="M8 10h8M8 13h5" />
        </svg>
      );
    case 'mypage':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.3" />
          <path d="M5.5 19.5c1.2-2.7 3.8-4 6.5-4s5.3 1.3 6.5 4" />
        </svg>
      );
    case 'achievements':
      return (
        <svg {...common}>
          <path d="M8 5h8v3.2a4 4 0 1 1-8 0V5Z" />
          <path d="M8 7H5a2 2 0 0 0 2 2M16 7h3a2 2 0 0 1-2 2" />
          <path d="M12 12v3M9.5 20h5" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4.5v2M12 17.5v2M19.5 12h-2M6.5 12h-2M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4M17.3 17.3l-1.4-1.4M8.1 8.1 6.7 6.7" />
        </svg>
      );
    default:
      return null;
  }
};

const menuItems = [
  { key: 'home', icon: 'home', label: '홈' },
  { key: 'works', icon: 'works', label: '작품 탐색' },
  { key: 'route', icon: 'route', label: '루트 생성' },
  { key: 'community', icon: 'community', label: '커뮤니티' },
  { key: 'mypage', icon: 'mypage', label: '마이페이지' },
];

const bottomItems = [
  { key: 'achievements', icon: 'achievements', label: '업적' },
  { key: 'settings', icon: 'settings', label: '설정' },
];

const Sidebar = ({ isOpen = false, onClose, activeKey = 'home', onNavigate }) => {
  return (
    <>
      <div
        className={isOpen ? `${styles.backdrop} ${styles.open}` : styles.backdrop}
        onClick={onClose}
      />

      <aside className={isOpen ? `${styles.sidebar} ${styles.open}` : styles.sidebar}>
        <div className={styles.topBar}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="close sidebar">
            ✕
          </button>
        </div>
        <ul className={styles.menu}>
          {menuItems.map((item) => (
            <li key={item.key}>
              <button
                className={activeKey === item.key ? styles.active : ''}
                onClick={() => {
                  onNavigate?.(item.key);
                  onClose?.();
                }}
              >
                <span className={styles.itemIcon}>
                  <LineIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.bottomMenu}>
          {bottomItems.map((item) => (
            <button key={item.key} onClick={onClose}>
              <span className={styles.itemIcon}>
                <LineIcon name={item.icon} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
