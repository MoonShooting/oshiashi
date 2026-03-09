import React from 'react';
import { Menu, Search, Upload } from 'lucide-react';
import { SidebarTrigger } from '@/components/layout/SidebarContext';
import styles from '@/styles/Navbar.module.css';

const NavBar = () => {
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
        <button className={styles.profileCircle} aria-label="profile" />
      </div>
    </nav>
  );
};

export default NavBar;
