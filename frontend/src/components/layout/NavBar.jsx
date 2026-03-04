import React from 'react';
import styles from '../../styles/Navbar.module.css';

// onMenuClick 추가하여 외부에서 제어할 수 있게 합니다.
const Navbar = ({ onMenuClick }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.searchWrapper}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          ≡
        </button>
        <input
          type="text"
          placeholder="작품명, 장소, 태그 검색..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.navRight}>
        <button className={styles.uploadBtn}>+ 루트 공유</button>
        <div className={styles.profileCircle}>👤</div>
      </div>
    </nav>
  );
};

export default Navbar;
