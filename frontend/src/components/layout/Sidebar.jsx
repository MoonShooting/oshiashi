import React, { useEffect, useMemo, useState } from 'react';
import { Film, House, LogIn, MapPinned, MessageSquare, Settings, Trophy, UserRound, X } from 'lucide-react';
import styles from '../../styles/Sidebar.module.css';

// 현재 탭 기준 로그인 여부 확인:
// accessToken 존재 시 로그인 상태로 간주합니다.
const readIsLoggedIn = () =>
  Boolean(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));

const Sidebar = ({ isOpen = false, onClose, activeKey = 'home', onNavigate }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(readIsLoggedIn);
  // 메인 메뉴 분기:
  // - 로그인 상태에서만 "마이페이지" 노출
  // - 비로그인 상태에서는 마이페이지 항목 자체를 제거
  const menuItems = useMemo(
    () =>
      isLoggedIn
        ? [
            { key: 'home', icon: House, label: '홈' },
            { key: 'works', icon: Film, label: '작품 탐색' },
            { key: 'route', icon: MapPinned, label: '루트 생성' },
            { key: 'community', icon: MessageSquare, label: '커뮤니티' },
            { key: 'mypage', icon: UserRound, label: '마이페이지' },
          ]
        : [
            { key: 'home', icon: House, label: '홈' },
            { key: 'works', icon: Film, label: '작품 탐색' },
            { key: 'route', icon: MapPinned, label: '루트 생성' },
            { key: 'community', icon: MessageSquare, label: '커뮤니티' },
          ],
    [isLoggedIn],
  );

  // 하단 메뉴 분기:
  // - 로그인: 업적/설정
  // - 비로그인: 로그인/설정
  const bottomItems = useMemo(
    () =>
      isLoggedIn
        ? [
            { key: 'achievements', icon: Trophy, label: '업적' },
            { key: 'settings', icon: Settings, label: '설정' },
          ]
        : [
            { key: 'login', icon: LogIn, label: '로그인' },
            { key: 'settings', icon: Settings, label: '설정' },
          ],
    [isLoggedIn],
  );

  useEffect(() => {
    // 로그인 상태 동기화:
    // - storage: 다른 탭에서 토큰 변경
    // - focus: 현재 탭 복귀 시 최신 토큰 반영
    const syncAuthState = () => setIsLoggedIn(readIsLoggedIn());

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

  return (
    <>
      <div
        className={isOpen ? `${styles.backdrop} ${styles.open}` : styles.backdrop}
        onClick={onClose}
      />

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
                }}
              >
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
