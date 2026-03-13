import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import styles from '../../styles/MainLayout.module.css';

const MainLayoutContent = ({
  children,
  isMapPage = false,
  mapComponent = null,
  leftSidebar = null,
  overlayUI = null,
  activeMenuKey = 'home',
  onNavigate,
}) => {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const routeMap = useMemo(
    () => ({
      home: '/',
      artwork: '/artworks',
      route: '/map',
      community: '/',
      post: '/posts',
      mypage: '/mypage',
      achievement: '/achievements',
      settings: '/',
      login: '/login',
    }),
    [],
  );

  const computedActiveKey = useMemo(() => {
    if (activeMenuKey) return activeMenuKey;
    if (location.pathname.startsWith('/artworks')) return 'artwork';
    if (location.pathname.startsWith('/map')) return 'route';
    if (location.pathname.startsWith('/posts')) return 'post';
    if (location.pathname.startsWith('/mypage')) return 'mypage';
    if (location.pathname.startsWith('/achievements')) return 'achievement';
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) return 'login';
    return 'home';
  }, [activeMenuKey, location.pathname]);

  const handleNavigate = (key) => {
    if (onNavigate) {
      onNavigate(key);
      return;
    }

    const path = routeMap[key];
    if (path && path !== location.pathname) {
      navigate(path);
    }
  };

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} activeKey={computedActiveKey} onNavigate={handleNavigate} />

      <div className={styles.mainArea}>
        <Navbar />

        <div className={styles.contentContainer}>
          {overlayUI ? <div className={styles.overlayUI}>{overlayUI}</div> : null}

          {isMapPage ? (
            <div className={styles.mapLayout}>
              {leftSidebar ? <aside className={styles.leftSidebar}>{leftSidebar}</aside> : null}
              <div className={styles.mapLayer}>{mapComponent}</div>
              <main className={styles.mapMain}>{children}</main>
            </div>
          ) : (
            <main className={styles.generalMain}>{children}</main>
          )}
        </div>
      </div>
    </div>
  );
};

const MainLayout = (props) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <MainLayoutContent {...props} />
    </SidebarProvider>
  );
};

export default MainLayout;
