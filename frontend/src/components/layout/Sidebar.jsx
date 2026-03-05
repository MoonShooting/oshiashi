import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/Sidebar.module.css';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <span className={styles.logo}>推し足</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {/* 상단 메뉴 영역 */}
        <nav className={styles.menu}>
          <Link to="/" className={styles.menuItem} onClick={onClose}>
            🏠 홈
          </Link>
          <Link to="/explore" className={styles.menuItem} onClick={onClose}>
            🔍 작품 탐색
          </Link>
          <Link to="/routes" className={styles.menuItem} onClick={onClose}>
            🗺️ 루트 공유
          </Link>
          <Link to="/community" className={styles.menuItem} onClick={onClose}>
            💬 커뮤니티
          </Link>
          <Link to="/mypage" className={styles.menuItem} onClick={onClose}>
            👤 마이페이지
          </Link>
        </nav>

        {/* 하단 고정 영역: 구분선 + 업적 + 설정 + 로그아웃 */}
        <div className={styles.footer}>
          <hr className={styles.divider} />
          <button className={styles.footerBtn}>🏆 업적</button>
          <Link to="/settings" className={styles.footerBtn} onClick={onClose}>
            ⚙️ 설정
          </Link>
          <button className={styles.logoutBtn}>로그아웃</button>
        </div>
      </aside>

      {isOpen && <div className={styles.overlay} onClick={onClose} />}
    </>
  );
};

export default Sidebar;
