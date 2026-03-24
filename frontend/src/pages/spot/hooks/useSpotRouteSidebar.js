import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteSpotBookmark,
  deleteSpotRoute,
  loadSpotSidebarRouteDetail,
  loadSpotSidebarRoutes,
  renameSpotBookmark,
  renameSpotRoute,
} from '@/api/spotRouteApi';

/**
 * 사이드패널(내 루트/북마크 루트) 전용 상태 훅
 *
 * 목적:
 * - SpotPage에서 목록 로딩/선택/수정/삭제 분기를 분리해 화면 컴포넌트를 단순화한다.
 * - UI 이벤트는 이 훅으로 모으고, 실제 저장 판정은 API/백엔드 응답으로 처리한다.
 */
export default function useSpotRouteSidebar({ replacePlaces, clearMap, setCenter, showToast }) {
  // 목록 데이터
  const [myRoutes, setMyRoutes] = useState([]);
  const [bookmarkedRoutes, setBookmarkedRoutes] = useState([]);

  // 현재 선택/표시 상태
  const [activeSidebarRouteKey, setActiveSidebarRouteKey] = useState('');
  const [visibleRouteSpots, setVisibleRouteSpots] = useState([]);

  // 오류/안내 상태
  const [sidebarError, setSidebarError] = useState('');
  const [sidebarIssues, setSidebarIssues] = useState([]);

  // route를 읽기 전용으로 보고 있는지, 혹은 편집 가능한 컨텍스트인지
  const [isRoutePreviewLocked, setIsRoutePreviewLocked] = useState(false);
  const [routeSaveContext, setRouteSaveContext] = useState(null);

  const allRoutes = useMemo(() => [...myRoutes, ...bookmarkedRoutes], [myRoutes, bookmarkedRoutes]);
  const activeSidebarRoute = useMemo(
    () => allRoutes.find((route) => route.key === activeSidebarRouteKey) ?? null,
    [allRoutes, activeSidebarRouteKey],
  );

  const refreshSidebarRoutes = useCallback(async () => {
    // 화면 초기 진입/작업 완료 후 공통으로 호출되는 목록 동기화 함수.
    setSidebarError('');
    try {
      const loaded = await loadSpotSidebarRoutes();
      setMyRoutes(loaded.myRoutes ?? []);
      setBookmarkedRoutes(loaded.bookmarkedRoutes ?? []);
      setSidebarIssues(loaded.issues ?? []);
    } catch (error) {
      setMyRoutes([]);
      setBookmarkedRoutes([]);
      setSidebarIssues([]);
      setSidebarError(error.message || '루트 목록을 불러오지 못했습니다.');
    }
  }, []);

  useEffect(() => {
    refreshSidebarRoutes();
  }, [refreshSidebarRoutes]);

  const resetRoutePreview = useCallback(() => {
    // "현재 route 미리보기"만 초기화한다. 목록 데이터는 유지한다.
    setActiveSidebarRouteKey('');
    setVisibleRouteSpots([]);
    setIsRoutePreviewLocked(false);
  }, []);

  const clearRouteSaveContext = useCallback(() => {
    setRouteSaveContext(null);
  }, []);

  const applyLoadedRoute = useCallback(
    (detail, { lock, saveContext = null } = {}) => {
      // "루트 선택"은 곧 지도 핀/경로 미리보기 갱신으로 연결된다.
      const spots = detail?.detailedSpots ?? [];
      setVisibleRouteSpots(spots);
      replacePlaces(spots);
      setRouteSaveContext(saveContext);
      setIsRoutePreviewLocked(Boolean(lock));
      if (spots[0]?.position) {
        // 첫 스팟 기준으로 지도를 이동해 사용자가 route를 즉시 인지하도록 한다.
        setCenter(spots[0].position);
      }
    },
    [replacePlaces, setCenter],
  );

  const handleSelectSidebarRoute = useCallback(
    async (route) => {
      // 사이드바에서 route를 클릭하면 기본 동작은 "읽기 전용 미리보기"다.
      if (!route?.key) return;
      setActiveSidebarRouteKey(route.key);

      try {
        const detail = await loadSpotSidebarRouteDetail({ route });
        applyLoadedRoute(detail, { lock: true });
      } catch (error) {
        setVisibleRouteSpots([]);
        alert(error.message || '루트 상세를 불러오지 못했습니다.');
      }
    },
    [applyLoadedRoute],
  );

  const prepareRouteEdit = useCallback(
    async (route, mode) => {
      // 수정 모드 진입 시에는 같은 상세 데이터를 불러오되 lock=false로 내려
      // 사용자가 핀을 추가/삭제하고 다시 저장할 수 있도록 전환한다.
      const detail = await loadSpotSidebarRouteDetail({ route });
      applyLoadedRoute(detail, {
        lock: false,
        saveContext: {
          mode,
          routeId: mode === 'edit' ? detail.routeId : null,
          title: detail.title,
          artworkTagName: detail.artworkTagName ?? detail.artworkTagNames?.[0] ?? '',
        },
      });

      showToast?.(mode === 'edit' ? '루트를 수정할 수 있게 불러왔습니다.' : '북마크 루트를 복사해 수정할 수 있게 불러왔습니다.');
    },
    [applyLoadedRoute, showToast],
  );

  const handleRouteAction = useCallback(
    async (actionKey, route) => {
      // 사이드바 점 3개 메뉴 액션 진입점.
      // sourceType(MY_ROUTE/BOOKMARKED_ROUTE)에 따라 API 엔드포인트가 달라진다.
      try {
        if (actionKey === 'edit') {
          await prepareRouteEdit(route, route.sourceType === 'MY_ROUTE' ? 'edit' : 'copy');
          return;
        }

        if (actionKey === 'rename') {
          const nextTitle = window.prompt('새 루트 이름을 입력해 주세요.', route.title);
          if (nextTitle == null || nextTitle.trim() === '' || nextTitle.trim() === route.title) return;

          // sourceType별로 API endpoint가 다르므로 분리 호출한다.
          if (route.sourceType === 'MY_ROUTE') {
            await renameSpotRoute({ route, newTitle: nextTitle });
          } else {
            await renameSpotBookmark({ route, newTitle: nextTitle });
          }

          await refreshSidebarRoutes();
          return;
        }

        if (actionKey !== 'delete') return;
        const confirmed = window.confirm(`'${route.title}' 루트를 삭제할까요?`);
        if (!confirmed) return;

        if (route.sourceType === 'MY_ROUTE') {
          await deleteSpotRoute({ route });
        } else {
          await deleteSpotBookmark({ route });
        }

        if (activeSidebarRouteKey === route.key) {
          clearMap();
          resetRoutePreview();
        }

        await refreshSidebarRoutes();
      } catch (error) {
        alert(error.message || '요청을 처리하지 못했습니다.');
      }
    },
    [activeSidebarRouteKey, clearMap, prepareRouteEdit, refreshSidebarRoutes, resetRoutePreview],
  );

  return {
    myRoutes,
    bookmarkedRoutes,
    activeSidebarRouteKey,
    visibleRouteSpots,
    sidebarError,
    sidebarIssues,
    isRoutePreviewLocked,
    routeSaveContext,
    activeSidebarRoute,
    refreshSidebarRoutes,
    resetRoutePreview,
    clearRouteSaveContext,
    handleSelectSidebarRoute,
    handleRouteAction,
  };
}
