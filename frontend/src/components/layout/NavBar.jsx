import React from 'react';
import { SidebarTrigger } from './SidebarContext';
import styles from '../../styles/Navbar.module.css';

const NavBar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <SidebarTrigger className={styles.menuBtn}>
          ☰
        </SidebarTrigger>
        <h1 className={styles.logo} lang="ja">
          推し足 (Oshiashi)
        </h1>
      </div>

      <form className={styles.searchWrapper} onSubmit={(e) => e.preventDefault()}>
        <span className={styles.searchIcon}>⌕</span>
        <input type="text" placeholder="작품명, 장소, 태그 검색..." className={styles.searchInput} />
      </form>

      <div className={styles.navRight}>
        <button className={styles.uploadBtn}>+ 루트 공유</button>
        <button className={styles.profileCircle} aria-label="profile" />
      </div>
    </nav>
  );
};

export default NavBar;
