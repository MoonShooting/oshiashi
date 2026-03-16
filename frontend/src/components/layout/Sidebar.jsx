import React from 'react';
import { Film, House, Map, MapPinned, MessageSquare, Settings, Trophy, UserRound, X } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/Sidebar.module.css';

const loggedInMenuItems = [
  { key: 'home', icon: House, label: '홈' },
  { key: 'artwork', icon: Film, label: '작품 탐색' },
  { key: 'map', icon: Map, label: '맵으로 보기' },
  { key: 'spot', icon: MapPinned, label: '루트 생성', disabled: true },
  { key: 'community', icon: MessageSquare, label: '커뮤니티' },
  { key: 'mypage', icon: UserRound, label: '마이페이지' },
];

const guestMenuItems = [
  { key: 'home', icon: House, label: '홈' },
  { key: 'artwork', icon: Film, label: '작품 탐색' },
  { key: 'map', icon: Map, label: '맵으로 보기' },
  { key: 'community', icon: MessageSquare, label: '커뮤니티' },
];

const loggedInBottomItems = [
  { key: 'achievement', icon: Trophy, label: '업적' },
  { key: 'settings', icon: Settings, label: '설정' },
];

const guestBottomItems = [
  { key: 'login', icon: UserRound, label: '로그인 페이지' },
  { key: 'settings', icon: Settings, label: '설정' },
];

const Sidebar = ({ isOpen = false, onClose, activeKey = 'home', onNavigate }) => {
  const { isLoggedIn } = useAuthStore();

  // 사이드바는 로그인 여부에 따라 메뉴 자체를 다르게 노출합니다.
  // 비로그인 상태에서는 마이페이지를 숨기고, 업적 대신 로그인 진입 버튼을 보여줍니다.
  const menuItems = isLoggedIn ? loggedInMenuItems : guestMenuItems;
  const bottomItems = isLoggedIn ? loggedInBottomItems : guestBottomItems;

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
                type="button"
                className={[activeKey === item.key ? styles.active : '', item.disabled ? styles.disabled : ''].filter(Boolean).join(' ')}
                disabled={item.disabled}
                aria-disabled={item.disabled ? 'true' : undefined}
                title={item.disabled ? '/spot 페이지가 준비되면 연결됩니다.' : undefined}
                onClick={() => {
                  if (item.disabled) return;
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
            <button
              key={item.key}
              onClick={() => {
                onNavigate?.(item.key);
                onClose?.();
              }}>
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
