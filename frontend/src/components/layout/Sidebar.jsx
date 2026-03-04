import React from 'react';
import styles from '../../styles/Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>推し足 (Oshiashi)</div>
      <ul className={styles.menu}>
        <li className={styles.active}>🏠 홈</li>
        <li>🔍 작품 탐색</li>
        <li>🗺️ 루트 공유</li>
        <li>💬 커뮤니티</li>
        <li>✍️ 게시물 작성</li>
        <li>👤 마이페이지</li>
      </ul>
      <div className={styles.bottomMenu}>
        <button>📢</button>
        <button>⚙️</button>
      </div>
    </aside>
  );
};

export default Sidebar;
