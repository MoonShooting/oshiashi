import React from 'react';
import { Film, House, MapPinned, MessageSquare, Settings, Trophy, UserRound, X } from 'lucide-react';
import styles from '@/styles/Sidebar.module.css';

const menuItems = [
  { key: 'home', icon: House, label: '홈' },
  { key: 'works', icon: Film, label: '작품 탐색' },
  { key: 'route', icon: MapPinned, label: '루트 생성' },
  { key: 'community', icon: MessageSquare, label: '커뮤니티' },
  { key: 'mypage', icon: UserRound, label: '마이페이지' },
];

const bottomItems = [
  { key: 'achievements', icon: Trophy, label: '업적' },
  { key: 'settings', icon: Settings, label: '설정' },
];

const Sidebar = ({ isOpen = false, onClose, activeKey = 'home', onNavigate }) => {
  return (
    <>
      <div className={isOpen ? `${styles.backdrop} ${styles.open}` : styles.backdrop} onClick={onClose} />

      <aside className={isOpen ? `${styles.sidebar} ${styles.open}` : styles.sidebar}>
        <div className={styles.topBar}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="close sidebar">
            <X className={styles.iconSvg} strokeWidth={2} />
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
                }}>
                <span className={styles.itemIcon}>
                  <item.icon className={styles.iconSvg} strokeWidth={1.9} />
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
                <item.icon className={styles.iconSvg} strokeWidth={1.9} />
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
