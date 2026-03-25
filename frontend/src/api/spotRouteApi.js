import { FetchJson } from '@/api/FetchClient';
import { appendUserIdQuery, fetchBookmarksWithFallback, normalizeTagNames } from '@/api/postApiShared';
import { getPlaceDetail } from '@/api/mapApi';

/**
 * SpotPage 전용 API 어댑터
 *
 * 핵심 원칙:
 * 1) 프론트는 "입력원 정규화 + 화면 표시"만 담당한다.
 * 2) 유효성/권한/저장 가능 여부 판정은 백엔드가 담당한다.
 *
 * 그래서 이 파일은 도메인 판정(if/throw)을 최소화하고,
 * 백엔드 계약 스키마로 변환하는 코드에 집중한다.
 */

const text = (value) => String(value ?? '').trim();
const num = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};
const uniq = (values) => [...new Set(values.filter(Boolean))];
const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  return [];
};
const unwrapObject = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (value.data && typeof value.data === 'object') return value.data;
  if (value.result && typeof value.result === 'object') return value.result;
  return value;
};

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const resolveUserId = (userId) => {
  if (typeof userId === 'string' && userId.trim()) return userId.trim();

  const storedToken = localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');
  if (!storedToken) return '';

  const token = storedToken.replace(/^Bearer\s+/i, '').trim();
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return '';

  try {
    const decoded = JSON.parse(decodeBase64Url(payloadPart));
    return String(decoded?.userId ?? decoded?.sub ?? decoded?.username ?? '').trim();
  } catch {
    return '';
  }
};

const withUserId = (endpoint, userId) => appendUserIdQuery(endpoint, resolveUserId(userId));

const normalizeRouteSpots = (route) =>
  // route 상세/목록 응답에서 `spots`/`routeSpots`가 혼재해도 UI 모델을 한 번에 통일한다.
  // 이 정규화가 있어야 SpotPage/SidePanel 훅이 백엔드 필드명 변경에 직접 영향받지 않는다.
  toArray(route?.spots ?? route?.routeSpots).map((spot, index) => ({
    routeSpotId: num(spot?.routeSpotId ?? spot?.routeId),
    spotId: num(spot?.spotId ?? spot?.placeId),
    spotName: text(spot?.spotName ?? spot?.name ?? spot?.title) || `장소 ${index + 1}`,
    artworkId: num(spot?.artworkId),
    artworkTitle: text(spot?.artworkTitle ?? ''),
    visitOrder: Number(spot?.visitOrder ?? index + 1),
  }));

const normalizeRoute = (route, { sourceType = 'MY_ROUTE', bookmark = null, canLoadDetail = true, loadIssue = '' } = {}) => {
  const routeSpots = normalizeRouteSpots(route);
  const explicitTagNames = normalizeTagNames(route?.artworkTagNames ?? route?.tagNames);
  const fallbackTagNames = uniq(routeSpots.map((spot) => spot.artworkTitle));
  const artworkTagNames = explicitTagNames.length > 0 ? explicitTagNames : fallbackTagNames;
  const routeId = num(route?.routeId ?? route?.id ?? bookmark?.routeId);
  const title =
    text(
      sourceType === 'BOOKMARKED_ROUTE'
        ? bookmark?.bookmarkName ?? route?.title ?? route?.routeTitle
        : route?.title ?? route?.routeTitle,
    ) || '이름 없는 루트';

  return {
    key: `${sourceType}-${routeId ?? num(bookmark?.bookmarkId) ?? Date.now()}`,
    routeId,
    title,
    count: num(route?.spotCount) ?? routeSpots.length,
    routeSpots,
    // 기존 화면과 신규 화면이 모두 같은 데이터로 동작하도록 alias를 유지한다.
    spots: routeSpots,
    artworkTagName: text(route?.artworkTagName ?? artworkTagNames[0] ?? ''),
    artworkTagNames,
    isPublic: Boolean(route?.isPublic),
    sourceType,
    bookmarkId: num(bookmark?.bookmarkId ?? route?.bookmarkId),
    bookmarkName: text(bookmark?.bookmarkName ?? route?.bookmarkName),
    canLoadDetail,
    loadIssue: text(loadIssue),
  };
};

const toDetailedSpot = async (routeSpot, index) => {
  // 사이드패널에서 route를 선택하면 "routeSpot(경량)" + "placeDetail(지도표시용)"를 합쳐
  // 지도/리스트가 공통으로 쓰는 상세 모델을 만든다.
  let place = null;
  try {
    place = await getPlaceDetail(routeSpot.spotId);
  } catch {
    place = null;
  }

  const lat = place?.latitude ?? place?.position?.lat ?? null;
  const lng = place?.longitude ?? place?.position?.lng ?? null;

  return {
    id: String(place?.id ?? place?.placeId ?? routeSpot?.spotId ?? `route-spot-${index}`),
    placeId: place?.placeId ?? String(routeSpot?.spotId ?? ''),
    spotId: routeSpot?.spotId,
    title: place?.title ?? place?.name ?? routeSpot?.spotName ?? `장소 ${index + 1}`,
    name: place?.name ?? routeSpot?.spotName ?? `장소 ${index + 1}`,
    workName: place?.artworkTitle ?? routeSpot?.artworkTitle ?? '',
    artworkId: place?.artworkId ?? routeSpot?.artworkId ?? null,
    artworkTitle: place?.artworkTitle ?? routeSpot?.artworkTitle ?? '',
    address: place?.address ?? '',
    position: lat != null && lng != null ? { lat: Number(lat), lng: Number(lng) } : null,
    latitude: lat != null ? Number(lat) : null,
    longitude: lng != null ? Number(lng) : null,
    color: '#374151',
  };
};

const fetchRouteDetail = async (routeId, userId) =>
  unwrapObject(await FetchJson(withUserId(`/api/v1/map/routes/${routeId}`, userId)));

const toRouteSaveSpot = (spot, index) => ({
  // 저장 요청 payload는 백엔드 계약(RouteSpotRequest)에 맞춘다.
  // 프론트에서 저장 가능/불가를 판정하지 않고, 필요한 입력값만 전달한다.
  spotId: num(spot?.spotId ?? spot?.placeId),
  artworkId: num(spot?.artworkId),
  spotName: text(spot?.spotName ?? spot?.name ?? spot?.title) || `장소 ${index + 1}`,
  address: text(spot?.address ?? ''),
  latitude: num(spot?.latitude ?? spot?.lat ?? spot?.position?.lat),
  longitude: num(spot?.longitude ?? spot?.lng ?? spot?.position?.lng),
  sceneImgUrl: text(spot?.sceneImgUrl ?? spot?.sceneImageUrl),
  visitOrder: index + 1,
});

export const createRouteWithArtworkTag = async ({ userId, routeId, title, selectedTag, spots = [] }) =>
  unwrapObject(
    await FetchJson(withUserId(routeId != null ? `/api/v1/map/routes/${routeId}` : '/api/v1/map/routes', userId), {
      method: routeId != null ? 'PATCH' : 'POST',
      body: JSON.stringify({
        title: text(title),
        isPublic: false,
        artworkId: selectedTag?.artworkId ?? null,
        // spotId가 없는 신규 장소도 그대로 전달한다.
        // 프론트가 "이 spot을 저장해도 되는지"를 추측하면 화면마다 판정이 달라질 수 있다.
        // 따라서 저장 가능 여부(좌표/작품/권한/스키마 검증)는 백엔드에서 단일 규칙으로 판정한다.
        spots: toArray(spots).map(toRouteSaveSpot),
      }),
    }),
  );

export const loadSpotSidebarRoutes = async ({ userId } = {}) => {
  // 화면 깨짐을 줄이기 위해 "일부 실패 허용" 전략을 사용한다.
  // 내 루트/북마크 루트 중 하나가 실패해도 다른 목록은 노출한다.
  const issues = [];

  let myRoutes = [];
  try {
    myRoutes = toArray(await FetchJson('/api/v1/user/myRoute')).map((route) => normalizeRoute(route, { sourceType: 'MY_ROUTE' }));
  } catch (error) {
    issues.push(error.message || '내 루트 목록을 불러오지 못했습니다.');
  }

  let bookmarkedRoutes = [];
  try {
    const routeBookmarks = (await fetchBookmarksWithFallback({ fetchJson: FetchJson })).filter((bookmark) => num(bookmark?.routeId) != null);
    bookmarkedRoutes = await Promise.all(
      routeBookmarks.map(async (bookmark) => {
        try {
          const detail = await fetchRouteDetail(bookmark.routeId, userId);
          return normalizeRoute(detail, { sourceType: 'BOOKMARKED_ROUTE', bookmark });
        } catch (error) {
          return normalizeRoute(
            { routeId: bookmark.routeId, title: bookmark.bookmarkName, spots: [] },
            {
              sourceType: 'BOOKMARKED_ROUTE',
              bookmark,
              canLoadDetail: false,
              loadIssue: error.message || '이 북마크 루트는 상세를 불러올 수 없습니다.',
            },
          );
        }
      }),
    );
  } catch (error) {
    issues.push(error.message || '북마크한 루트 목록을 불러오지 못했습니다.');
  }

  return { myRoutes, bookmarkedRoutes, issues };
};

export const loadSpotSidebarRouteDetail = async ({ route, userId } = {}) => {
  if (!route?.routeId) throw new Error('루트 상세를 확인할 수 없습니다.');
  if (route.canLoadDetail === false) throw new Error(route.loadIssue || '이 루트는 상세를 불러올 수 없습니다.');

  const detail = normalizeRoute(await fetchRouteDetail(route.routeId, userId), {
    sourceType: route.sourceType ?? 'MY_ROUTE',
    bookmark: route,
  });

  return {
    ...detail,
    // route_spot + 장소 상세 조회 결과를 병합해 사이드패널/지도 공용 모델로 만든다.
    detailedSpots: await Promise.all(detail.routeSpots.map(toDetailedSpot)),
  };
};

export const renameSpotRoute = async ({ route, newTitle, userId } = {}) => {
  const detail = await loadSpotSidebarRouteDetail({ route, userId });
  await FetchJson(withUserId(`/api/v1/map/routes/${detail.routeId}`, userId), {
    method: 'PATCH',
    body: JSON.stringify({
      title: text(newTitle),
      isPublic: detail.isPublic ?? false,
      artworkId: detail.routeSpots[0]?.artworkId ?? null,
      // 이름 변경도 동일한 route 저장 계약을 재사용해 서버 일관성을 유지한다.
      // 별도 rename endpoint를 두지 않아도 되는 이유는 "route 전체 상태"를 한 번에 갱신하기 때문이다.
      spots: detail.routeSpots.map((spot, index) => ({ spotId: spot.spotId, visitOrder: index + 1 })),
    }),
  });
};

export const deleteSpotRoute = async ({ route, userId } = {}) =>
  FetchJson(withUserId(`/api/v1/map/routes/${route?.routeId}`, userId), {
    method: 'DELETE',
  });

export const renameSpotBookmark = async ({ route, newTitle, userId } = {}) =>
  FetchJson(withUserId(`/api/v1/bookmarks/${route?.bookmarkId}`, userId), {
    method: 'PATCH',
    body: JSON.stringify({ newName: text(newTitle) }),
  });

export const deleteSpotBookmark = async ({ route, userId } = {}) =>
  FetchJson(withUserId(`/api/v1/bookmarks/${route?.bookmarkId}`, userId), {
    method: 'DELETE',
  });
