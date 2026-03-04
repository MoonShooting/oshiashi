import React, { useState } from 'react';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import styles from '../../styles/MainLayout.module.css';

const MainLayout = ({ children, isMapPage, mapComponent }) => {
  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutWrapper}>
      {/* 1. 사이드바에 상태와 닫기 함수를 전달합니다. */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className={styles.mainArea}>
        {/* 2. Navbar에 열기 함수를 전달합니다. */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        <div className={styles.contentContainer}>
          {isMapPage && <div className={styles.mapLayer}>{mapComponent}</div>}
          <main className={isMapPage ? styles.mapMain : styles.generalMain}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
