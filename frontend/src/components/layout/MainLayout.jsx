import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import styles from '../../styles/MainLayout.module.css';

const MainLayoutContent = ({ children, activeMenuKey }) => {
  const { open, setOpen } = useSidebar();
  const location = useLocation();

  // 현재 경로를 기반으로 Sidebar에 알려줄 activeKey 계산 (순수 UI 로직)
  const computedActiveKey = useMemo(() => {
    if (activeMenuKey) return activeMenuKey;
    const path = location.pathname;
    if (path.startsWith('/artworks')) return 'artwork';
    if (path.startsWith('/community')) return 'community';
    if (path.startsWith('/posts')) return 'posts';
    if (path.startsWith('/mypage')) return 'mypage';
    if (path.startsWith('/achievements')) return 'achievement';
    if (path.includes('/login') || path.includes('/signup')) return 'login';
    return 'home';
  }, [activeMenuKey, location.pathname]);

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} activeKey={computedActiveKey} />

      <div className={styles.mainArea}>
        <Navbar />
        <main className={styles.generalMain}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>
    </div>
  );
};

const MainLayout = (props) => (
  <SidebarProvider defaultOpen={false}>
    <MainLayoutContent {...props} />
  </SidebarProvider>
);

export default MainLayout;
