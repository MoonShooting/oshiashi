import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, Search, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/layout/SidebarContext';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/Navbar.module.css';

const NavBar = () => {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isLoggedIn, isInitialized, user, logout } = useAuthStore();
  const hasAuthenticatedUser = Boolean(user?.userId || user?.nickname || user?.email);
  const showProfileMenu = isLoggedIn && isInitialized && hasAuthenticatedUser;

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
        <h1 className={styles.logo} lang="ja">
          推し足 (Oshiashi)
        </h1>
      </div>

      <form className={styles.searchWrapper} onSubmit={(e) => e.preventDefault()}>
        <Search className={styles.searchIcon} strokeWidth={2.4} />
        <input type="text" placeholder="작품명, 장소, 태그 검색..." className={styles.searchInput} />
      </form>

      <div className={styles.navRight}>
        <button className={styles.uploadBtn}>
          <Upload className={styles.uploadIcon} strokeWidth={2.1} />
          <span>루트 공유</span>
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
