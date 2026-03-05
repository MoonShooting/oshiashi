import React from 'react';
import styles from '../../styles/Navbar.module.css';

const Navbar = ({ onMenuClick }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          ≡
        </button>
        <span className={styles.logoText}>推し足 (Oshiashi)</span>
      </div>

      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon}>🔍</span>
        <input type="text" placeholder="작품명, 장소, 태그 검색..." className={styles.searchInput} />
      </div>

      <div className={styles.navRight}>
        <button className={styles.uploadBtn}>+ 루트 공유</button>
        <div className={styles.profileCircle}>
          <span className={styles.profileIcon}>👤</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
