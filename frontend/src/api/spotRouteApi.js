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

const routeDetailCache = new Map();
const routeDetailInFlight = new Map();

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

// 북마크 응답의 pins는 이미 route_spot 순서대로 정렬된 장소 요약입니다.
// SpotPage에서는 "선택 즉시 지도와 우측 패널에 장소를 그릴 수 있는 최소 정보"만 있으면 되므로,
// owner-scoped route detail API가 실패해도 이 요약 데이터만으로 편집/복사 진입을 이어갈 수 있습니다.
// 이 fallback은 북마크 응답을 SpotPage 전용 route 모델로 바꾸는 역할을 합니다.
const normalizeBookmarkedRouteFromPins = (bookmark) => {
  const routeId = num(bookmark?.routeId);
  const rawPins = toArray(bookmark?.pins);
  if (routeId == null || rawPins.length === 0) return null;

  const routeSpots = rawPins.map((pin, index) => ({
    routeSpotId: null,
    spotId: num(pin?.id ?? pin?.spotId),
    spotName: text(pin?.name ?? pin?.buildingName) || `장소 ${index + 1}`,
    artworkId: num(pin?.artwork?.id ?? pin?.artworkId),
    artworkTitle: text(pin?.artwork?.title ?? pin?.artworkTitle),
    visitOrder: index + 1,
  }));

  return {
    key: `BOOKMARKED_ROUTE-${routeId}`,
    routeId,
    title: text(bookmark?.bookmarkName) || `북마크 루트 ${routeId}`,
    count: routeSpots.length,
    routeSpots,
    spots: routeSpots,
    artworkTagName: text(routeSpots[0]?.artworkTitle),
    artworkTagNames: uniq(routeSpots.map((spot) => spot.artworkTitle)),
    isPublic: false,
    sourceType: 'BOOKMARKED_ROUTE',
    bookmarkId: num(bookmark?.bookmarkId),
    bookmarkName: text(bookmark?.bookmarkName),
    canLoadDetail: false,
    loadIssue: '북마크 응답의 장소 정보로 복원한 루트입니다.',
    // 선택 시 getPlaceDetail 재호출 없이 바로 쓸 수 있도록 원본 pin도 함께 보관합니다.
    bookmarkPins: rawPins,
  };
};

// 북마크 목록 렌더링 단계에서는 bookmark response 자체에 routeId, bookmarkName,
// pinCount, pins가 이미 들어 있습니다.
// 따라서 "목록을 보여주기 위해" route detail을 bookmark 개수만큼 추가 호출할 필요가 없습니다.
// 여기서는 즉시 렌더 가능한 최소 route 모델만 만들고,
// 사용자가 실제로 눌렀을 때만 상세 조회/복원을 시도하도록 분리합니다.
const normalizeBookmarkedRouteSummary = (bookmark) => {
  const restored = normalizeBookmarkedRouteFromPins(bookmark);
  if (restored) {
    return {
      ...restored,
      title: text(bookmark?.bookmarkName) || restored.title,
      count: num(bookmark?.pinCount) ?? restored.count,
      canLoadDetail: true,
      loadIssue: '',
    };
  }

  const routeId = num(bookmark?.routeId);
  if (routeId == null) return null;

  return {
    key: `BOOKMARKED_ROUTE-${routeId}`,
    routeId,
    title: text(bookmark?.bookmarkName) || `북마크 루트 ${routeId}`,
    count: num(bookmark?.pinCount) ?? 0,
    routeSpots: [],
    spots: [],
    artworkTagName: '',
    artworkTagNames: [],
    isPublic: false,
    sourceType: 'BOOKMARKED_ROUTE',
    bookmarkId: num(bookmark?.bookmarkId),
    bookmarkName: text(bookmark?.bookmarkName),
    canLoadDetail: true,
    loadIssue: '',
    bookmarkPins: toArray(bookmark?.pins),
  };
};

// 공개 게시물 상세는 소유자 검사가 없고 entries에 장소 정보가 담겨 있으므로,
// 북마크 route detail이 막힌 경우 "pins보다 풍부한" 두 번째 복구 경로로 사용합니다.
// pins는 요약 정보지만, entries는 작성자가 남긴 제목/이미지/주소가 더 많이 담길 수 있어
// 가능한 한 먼저 시도하는 편이 지도/우측 패널 품질이 좋습니다.
const normalizeBookmarkedRouteFromPost = (postResponse, bookmark) => {
  const routeId = num(postResponse?.routeId ?? bookmark?.routeId);
  const entries = toArray(postResponse?.entries);
  if (routeId == null || entries.length === 0) return null;

  const routeSpots = entries.map((entry, index) => ({
    routeSpotId: null,
    spotId: num(entry?.spotId),
    spotName: text(entry?.name ?? entry?.title) || `장소 ${index + 1}`,
    artworkId: null,
    artworkTitle: text(entry?.artworkTitle),
    visitOrder: index + 1,
  }));

  return {
    key: `BOOKMARKED_ROUTE-${routeId}`,
    routeId,
    title: text(postResponse?.routeTitle ?? bookmark?.bookmarkName ?? postResponse?.title) || `북마크 루트 ${routeId}`,
    count: routeSpots.length,
    routeSpots,
    spots: routeSpots,
    artworkTagName: text(routeSpots[0]?.artworkTitle),
    artworkTagNames: uniq(routeSpots.map((spot) => spot.artworkTitle)),
    isPublic: false,
    sourceType: 'BOOKMARKED_ROUTE',
    bookmarkId: num(bookmark?.bookmarkId),
    bookmarkName: text(bookmark?.bookmarkName),
    canLoadDetail: false,
    loadIssue: '북마크 게시물의 장소 정보로 복원한 루트입니다.',
    bookmarkEntries: entries,
  };
};

const fetchRouteDetail = async (routeId, userId) => {
  const key = `${routeId}:${resolveUserId(userId)}`;

  if (routeDetailCache.has(key)) {
    return routeDetailCache.get(key);
  }

  if (routeDetailInFlight.has(key)) {
    return routeDetailInFlight.get(key);
  }

  const request = FetchJson(withUserId(`/api/v1/map/routes/${routeId}`, userId))
    .then((response) => {
      const unwrapped = unwrapObject(response);
      routeDetailCache.set(key, unwrapped);
      routeDetailInFlight.delete(key);
      return unwrapped;
    })
    .catch((error) => {
      routeDetailInFlight.delete(key);
      throw error;
    });

  routeDetailInFlight.set(key, request);
  return request;
};

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

  const [myRoutesResult, bookmarksResult] = await Promise.allSettled([
    FetchJson('/api/v1/user/myRoute'),
    fetchBookmarksWithFallback({ fetchJson: FetchJson }),
  ]);

  const myRoutes =
    myRoutesResult.status === 'fulfilled'
      ? toArray(myRoutesResult.value).map((route) => normalizeRoute(route, { sourceType: 'MY_ROUTE' }))
      : [];
  if (myRoutesResult.status === 'rejected') {
    issues.push(myRoutesResult.reason?.message || '내 루트 목록을 불러오지 못했습니다.');
  }

  const bookmarkedRoutes =
    bookmarksResult.status === 'fulfilled'
      ? toArray(bookmarksResult.value)
          .filter((bookmark) => num(bookmark?.routeId) != null)
          .map((bookmark) => normalizeBookmarkedRouteSummary(bookmark))
          .filter(Boolean)
      : [];
  if (bookmarksResult.status === 'rejected') {
    issues.push(bookmarksResult.reason?.message || '북마크한 루트 목록을 불러오지 못했습니다.');
  }

  return { myRoutes, bookmarkedRoutes, issues };
};

export const loadSpotSidebarRouteDetail = async ({ route, userId } = {}) => {
  if (!route?.routeId) throw new Error('루트 상세를 확인할 수 없습니다.');
  if (route.canLoadDetail === false) {
    // loadSpotSidebarRoutes에서 이미 "복원 가능한 북마크 route"로 판정된 경우입니다.
    // 이때는 서버를 다시 치지 않고, 그때 보관해 둔 bookmarkPins/bookmarkEntries를
    // SpotPage가 소비하는 detailedSpots 형식으로만 다시 가공합니다.
    if (Array.isArray(route.bookmarkPins) && route.bookmarkPins.length > 0) {
      const detailedSpots = route.bookmarkPins.map((pin, index) => ({
        id: String(pin?.id ?? `bookmark-pin-${index}`),
        placeId: String(pin?.id ?? ''),
        spotId: num(pin?.id ?? pin?.spotId),
        title: pin?.name ?? pin?.buildingName ?? `장소 ${index + 1}`,
        name: pin?.name ?? pin?.buildingName ?? `장소 ${index + 1}`,
        workName: pin?.artwork?.title ?? pin?.artworkTitle ?? '',
        artworkId: num(pin?.artwork?.id ?? pin?.artworkId),
        artworkTitle: pin?.artwork?.title ?? pin?.artworkTitle ?? '',
        address: pin?.address ?? '',
        position:
          pin?.latitude != null && pin?.longitude != null
            ? { lat: Number(pin.latitude), lng: Number(pin.longitude) }
            : null,
        latitude: pin?.latitude != null ? Number(pin.latitude) : null,
        longitude: pin?.longitude != null ? Number(pin.longitude) : null,
        color: '#374151',
      }));

      return {
        ...route,
        detailedSpots,
      };
    }

    if (Array.isArray(route.bookmarkEntries) && route.bookmarkEntries.length > 0) {
      const detailedSpots = route.bookmarkEntries.map((entry, index) => ({
        id: String(entry?.spotId ?? `bookmark-entry-${index}`),
        placeId: String(entry?.spotId ?? ''),
        spotId: num(entry?.spotId),
        title: entry?.name ?? entry?.title ?? `장소 ${index + 1}`,
        name: entry?.name ?? entry?.title ?? `장소 ${index + 1}`,
        workName: entry?.artworkTitle ?? '',
        artworkId: null,
        artworkTitle: entry?.artworkTitle ?? '',
        address: entry?.address ?? '',
        position:
          entry?.latitude != null && entry?.longitude != null
            ? { lat: Number(entry.latitude), lng: Number(entry.longitude) }
            : null,
        latitude: entry?.latitude != null ? Number(entry.latitude) : null,
        longitude: entry?.longitude != null ? Number(entry.longitude) : null,
        color: '#374151',
      }));

      return {
        ...route,
        detailedSpots,
      };
    }

    // 복원에 쓸 원본 데이터조차 없으면 여기서만 실제 오류로 간주합니다.
    throw new Error(route.loadIssue || '이 루트는 상세를 불러올 수 없습니다.');
  }

  try {
    const detail = normalizeRoute(await fetchRouteDetail(route.routeId, userId), {
      sourceType: route.sourceType ?? 'MY_ROUTE',
      bookmark: route,
    });

    return {
      ...detail,
      // route_spot + 장소 상세 조회 결과를 병합해 사이드패널/지도 공용 모델로 만든다.
      detailedSpots: await Promise.all(detail.routeSpots.map(toDetailedSpot)),
    };
  } catch (error) {
    // 북마크 route 상세는 소유자 조건 때문에 실패할 수 있습니다.
    // 이 경우 목록에서 이미 받아 둔 bookmark pins/post fallback을 최대한 재사용해
    // "다시 목록을 로딩하느라 오래 기다렸는데 선택도 실패"하는 경험을 줄입니다.
    if (route.sourceType === 'BOOKMARKED_ROUTE') {
      try {
        if (route?.postId != null) {
          const bookmarkedPost = await FetchJson(`/api/v1/posts/${route.postId}`);
          const restoredFromPost = normalizeBookmarkedRouteFromPost(bookmarkedPost, route);
          if (restoredFromPost) {
            return loadSpotSidebarRouteDetail({ route: restoredFromPost, userId });
          }
        }
      } catch {
        // post fallback 실패 시 pins fallback으로 내려갑니다.
      }

      const restoredFromPins = normalizeBookmarkedRouteFromPins(route);
      if (restoredFromPins) {
        return loadSpotSidebarRouteDetail({ route: restoredFromPins, userId });
      }
    }

    throw error;
  }
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
