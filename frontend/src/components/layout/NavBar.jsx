import React, { useEffect, useRef, useState } from 'react';
import { CircleUserRound, LogIn, Menu, Search, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SidebarTrigger } from './SidebarContext';
import styles from '../../styles/Navbar.module.css';

// 현재 탭 기준 로그인 여부 확인:
// accessToken이 localStorage/sessionStorage 중 어디에 있든 "로그인"으로 판단합니다.
const readIsLoggedIn = () =>
  Boolean(localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'));

const NavBar = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(readIsLoggedIn);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!profileMenuRef.current) return;
      if (profileMenuRef.current.contains(event.target)) return;
      setMenuOpen(false);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    // 로그인 상태 동기화:
    // - storage: 다른 탭에서 토큰이 변경될 때
    // - focus: 현재 탭으로 돌아왔을 때 최신 토큰 재조회
    const syncAuthState = () => setIsLoggedIn(readIsLoggedIn());

    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, []);

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
        <div className={styles.profileMenu} ref={profileMenuRef}>
          <button
            type="button"
            className={styles.profileCircle}
            aria-label="profile"
            onClick={() => setMenuOpen((prev) => !prev)}>
            <CircleUserRound size={20} />
          </button>
          {menuOpen ? (
            <div className={styles.profileDropdown}>
              {/* 드롭다운 분기:
                  로그인 상태면 "나의 정보", 비로그인 상태면 "로그인 하기" 노출 */}
              {isLoggedIn ? (
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/');
                  }}>
                  나의 정보
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.dropdownItem}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate('/login');
                  }}>
                  <LogIn size={16} />
                  <span>로그인 하기</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
