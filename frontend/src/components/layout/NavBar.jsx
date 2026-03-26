import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogIn, Menu, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '@/components/layout/BrandLogo';
import { SidebarTrigger } from '@/components/layout/SidebarContext';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/Navbar.module.css';

const formatTokenRemaining = (remainingMs) => {
  const safeSeconds = Math.max(0, Math.ceil(Number(remainingMs ?? 0) / 1000));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const NavBar = () => {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const logout = useAuthStore((s) => s.logout);
  const tokenRemainingMs = useAuthStore((s) => s.tokenRemainingMs);
  // /auth/me 초기화 타이밍과 무관하게, 토큰 기준 로그인 상태면 메뉴를 안정적으로 노출합니다.
  const showProfileMenu = isLoggedIn;
  const isGuestAction = !isLoggedIn;
  const ActionIcon = isGuestAction ? LogIn : Upload;
  const showTokenCountdown = isLoggedIn && tokenRemainingMs > 0;

  const handlePrimaryAction = () => {
    navigate(isGuestAction ? '/login' : '/posts/create');
  };

  // 프로필 메뉴는 버튼 외부를 누르면 닫히도록 처리해, 상단 UI가 계속 열린 채 남지 않게 합니다.
  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!profileMenuRef.current?.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleProfilePrimaryAction = () => {
    setIsProfileMenuOpen(false);
    navigate('/mypage');
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <SidebarTrigger className={styles.menuBtn}>
          <Menu size={20} strokeWidth={2.2} />
        </SidebarTrigger>
        <button type="button" className={styles.logoButton} aria-label="홈으로 이동" onClick={() => navigate('/')}>
          <BrandLogo className={styles.logoGraphic} />
        </button>
      </div>

      <div className={styles.navRight}>
        {showTokenCountdown ? (
          <div className={styles.tokenTimer} aria-label="남은 토큰 유효시간">
            <span className={styles.tokenTimerLabel}>남은 시간</span>
            <strong>{formatTokenRemaining(tokenRemainingMs)}</strong>
          </div>
        ) : null}

        <button type="button" className={styles.uploadBtn} onClick={handlePrimaryAction}>
          <ActionIcon className={styles.uploadIcon} strokeWidth={2.1} />
          <span>{isGuestAction ? '로그인하기' : '게시물 작성'}</span>
        </button>

        {showProfileMenu ? (
          <div className={styles.profileMenuWrap} ref={profileMenuRef}>
            <button
              type="button"
              className={styles.profileTrigger}
              aria-label="profile menu"
              aria-expanded={isProfileMenuOpen}
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}>
              <span className={styles.profileCircle} />
              <ChevronDown className={styles.profileChevron} strokeWidth={2.1} />
            </button>

            {isProfileMenuOpen ? (
              <div className={styles.profileDropdown}>
                <button type="button" className={styles.profileDropdownItem} onClick={handleProfilePrimaryAction}>
                  마이페이지
                </button>

                <button type="button" className={styles.profileDropdownItemMuted} onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
};

export default NavBar;
