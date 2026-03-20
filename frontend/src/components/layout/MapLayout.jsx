import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import styles from '../../styles/MapLayout.module.css';

const MapLayoutContent = ({
  children,
  mapComponent,
  leftSidebar,
  rightSidebar,
  activeMenuKey, // 아래 계산 로직
}) => {
  const { open, setOpen } = useSidebar();
  const location = useLocation(); // 현재 경로 가져오기

  //순수 UI 로직으로 activeKey 계산
  const computedActiveKey = useMemo(() => {
    if (activeMenuKey) return activeMenuKey; // Router에서 명시적으로 넘겨주면 그걸 최우선 사용

    const path = location.pathname;
    if (path.startsWith('/map')) return 'map';
    if (path.startsWith('/spot')) return 'spot';
  }, [activeMenuKey, location.pathname]);

  return (
    <div className={styles.mapLayoutWrapper}>
      <Sidebar isOpen={open} onClose={() => setOpen(false)} activeKey={computedActiveKey} />

      <div className={styles.mapMainArea}>
        <Navbar />

        <div className={styles.mapContentContainer}>
          {leftSidebar && <div className={styles.leftPanel}>{leftSidebar}</div>}

          <div className={styles.mapCanvas}>{mapComponent}</div>

          {rightSidebar && <div className={styles.rightPanel}>{rightSidebar}</div>}

          {children && <div className={styles.mapOverlay}>{children}</div>}
        </div>
      </div>
    </div>
  );
};

const MapLayout = (props) => (
  <SidebarProvider defaultOpen={false}>
    <MapLayoutContent {...props} />
  </SidebarProvider>
);

export default MapLayout;
