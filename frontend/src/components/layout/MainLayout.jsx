import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';
import styles from '../../styles/MainLayout.module.css';

/**
 * MainLayoutContent는 실제 레이아웃 렌더링을 담당합니다.
 * - 일반 페이지와 지도형 페이지의 배치를 나누고
 * - 사이드바 active 상태 계산
 * - 메뉴 key -> path 이동 연결
 * 을 한 곳에서 처리합니다.
 */
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

  // Sidebar는 메뉴 key만 전달하므로, 실제 이동 경로는 layout에서 공통으로 관리합니다.
  // 이렇게 두면 페이지마다 navigate 로직을 따로 들고 있지 않아도 메뉴 이동을 통일할 수 있습니다.
  const routeMap = useMemo(
    () => ({
      home: '/',
      artwork: '/artworks',
      works: '/',
      map: '/map', // 지도 전체 보기
      spot: '/spot', // 경로 만들기
      community: '/',
      post: '/posts',
      mypage: '/mypage',
      achievement: '/achievements',
      settings: '/',
      login: '/login',
    }),
    [],
  );

  // activeMenuKey를 페이지에서 명시적으로 넘기면 그 값을 우선 사용합니다.
  // 그렇지 않으면 현재 URL pathname을 기준으로 어떤 메뉴가 선택 상태인지 계산합니다.
  // 즉, MainLayout은 "페이지가 직접 지정한 상태"와 "현재 경로 기반 상태"를 둘 다 지원합니다.
  const computedActiveKey = useMemo(() => {
    if (activeMenuKey) return activeMenuKey;
    if (location.pathname.startsWith('/artworks')) return 'artwork';
    if (location.pathname.startsWith('/map')) return 'map';
    if (location.pathname.startsWith('/posts')) return 'post';
    if (location.pathname.startsWith('/mypage')) return 'mypage';
    if (location.pathname.startsWith('/achievements')) return 'achievement';
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) return 'login';
    return 'home';
  }, [activeMenuKey, location.pathname]);

  // Sidebar가 눌렸을 때 key만 받아 실제 path로 변환해 이동합니다.
  // onNavigate가 주입되면 외부 페이지가 이동을 직접 제어하고,
  // 없으면 MainLayout의 기본 routeMap을 사용해 동작합니다.
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
      {/* Sidebar는 전역 메뉴이므로 모든 페이지에서 같은 위치에 렌더합니다.
          activeKey는 현재 경로 또는 페이지 지정값을 기준으로 계산됩니다. */}
      <Sidebar isOpen={open} onClose={() => setOpen(false)} activeKey={computedActiveKey} onNavigate={handleNavigate} />

      <div className={styles.mainArea}>
        <Navbar />

        <div className={styles.contentContainer}>
          {/* overlayUI는 특정 페이지가 NavBar 아래 고정 UI를 추가로 얹어야 할 때 사용합니다. */}
          {overlayUI ? <div className={styles.overlayUI}>{overlayUI}</div> : null}

          {isMapPage ? (
            // 지도형 페이지는 일반 문서형 레이아웃과 달리
            // 왼쪽 보조 패널 + 지도 레이어 + 본문 영역을 동시에 사용합니다.
            <div className={styles.mapLayout}>
              {leftSidebar ? <aside className={styles.leftSidebar}>{leftSidebar}</aside> : null}
              <div className={styles.mapLayer}>{mapComponent}</div>
              <main className={styles.mapMain}>{children}</main>
            </div>
          ) : (
            // 일반 페이지는 하나의 메인 본문 영역만 렌더합니다.
            <main className={styles.generalMain}>{children}</main>
          )}
        </div>
      </div>
    </div>
  );
};

// MainLayout은 SidebarContext를 항상 함께 감싸서,
// 어느 페이지에서든 같은 사이드바 열림 상태와 토글 동작을 사용할 수 있게 합니다.
const MainLayout = (props) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <MainLayoutContent {...props} />
    </SidebarProvider>
  );
};

export default MainLayout;
