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
export default function useSpotRouteSidebar({ replacePlaces, clearMap, setCenter, showToast, openRouteDialog }) {
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

  const startMapSearchMode = useCallback(() => {
    // 읽기 전용으로 보고 있던 기존 루트는 "지도 검색" 진입 시 해제한다.
    // 그래야 새 루트를 만들기 위해 장소를 추가할 때 우측 패널이 잠금 상태로 남지 않는다.
    // 단, 이미 수정/복사 컨텍스트로 편집 중이면 현재 route를 유지한 채 계속 추가 가능해야 한다.
    if (routeSaveContext) {
      // edit/copy 상태는 "현재 선택된 route를 기반으로 편집 중"이라는 뜻이므로
      // active route와 selectedPlaces를 유지한 채 잠금만 해제한다.
      setIsRoutePreviewLocked(false);
      return;
    }

    // 단순 조회 상태에서 지도 검색으로 넘어가는 경우는
    // "기존 루트를 보고 있던 모드"를 끝내고 새 루트 작성 모드로 전환하는 의미입니다.
    // 따라서 선택 루트, 지도 미리보기, selectedPlaces를 모두 초기화합니다.
    clearMap();
    resetRoutePreview();
    setVisibleRouteSpots([]);
  }, [clearMap, resetRoutePreview, routeSaveContext]);

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
        await openRouteDialog?.({
          type: 'alert',
          title: '루트 불러오기 실패',
          message: error.message || '루트 상세를 불러오지 못했습니다.',
          confirmText: '확인',
        });
      }
    },
    [applyLoadedRoute, openRouteDialog],
  );

  const prepareRouteEdit = useCallback(
    async (route, mode) => {
      // 수정 모드 진입 시에는 같은 상세 데이터를 불러오되 lock=false로 내려
      // 사용자가 핀을 추가/삭제하고 다시 저장할 수 있도록 전환한다.
      // mode === 'copy' 는 북마크 루트를 가져와 "새 루트처럼 편집"하는 시나리오다.
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
          const nextTitle = await openRouteDialog?.({
            type: 'prompt',
            title: '루트 이름 변경',
            message: '새 루트 이름을 입력해 주세요.',
            initialValue: route.title,
            inputPlaceholder: '루트 이름을 입력하세요',
            confirmText: '변경',
            cancelText: '취소',
          });
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
        const confirmed = await openRouteDialog?.({
          type: 'confirm',
          title: '루트 삭제',
          message: `'${route.title}' 루트를 삭제할까요?`,
          confirmText: '삭제',
          cancelText: '취소',
        });
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
        await openRouteDialog?.({
          type: 'alert',
          title: '요청 처리 실패',
          message: error.message || '요청을 처리하지 못했습니다.',
          confirmText: '확인',
        });
      }
    },
    [activeSidebarRouteKey, clearMap, openRouteDialog, prepareRouteEdit, refreshSidebarRoutes, resetRoutePreview],
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
    startMapSearchMode,
    handleSelectSidebarRoute,
    handleRouteAction,
  };
}
