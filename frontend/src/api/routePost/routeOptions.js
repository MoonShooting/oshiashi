/*
[routeOptions - 작성 페이지 루트 선택/복원 로직]
- normalizeRouteOption: API 루트 응답을 작성 페이지용 선택지 모델로 변환
- normalizeBookmarkedRouteFromPins: 북마크 pins 기반 최소 루트 복원
- normalizeBookmarkedRouteFromPostDetail: 공개 게시물 상세 기반 루트 복원
- buildDevMockRoutes: 개발 환경 목업 루트 빌더
- dedupeRoutes: 중복 루트 제거
- buildRouteCreatePayload: 게시글 생성 JSON payload 빌더
- loadPostCreateRoutes: 작성 페이지 루트 로딩 (내 루트 + 북마크 루트)
*/

import { FetchJson } from '@/api/FetchClient';
import {
  appendUserIdQuery,
  extractArrayPayload,
  fetchBookmarksWithFallback,
} from '@/api/postApiShared';
import { MOCK_POST_CREATE_ROUTES } from '@/data/post/postCreateMockData';

import {
  normalizeTagNames,
  parseNumber,
  resolvePersistableReferenceImageUrl,
  resolvePersistableUserImageUrl,
  toRoutePostDetail,
} from './normalize';
import { resolveUserIdForRouteQuery } from './tokenUtils';

// ── 개발 환경 플래그 ────────────────────────────────────────
const ENABLE_POST_CREATE_MOCK_ROUTES =
  import.meta.env.DEV &&
  String(import.meta.env.VITE_ENABLE_POST_CREATE_MOCK_ROUTES ?? 'true').toLowerCase() !== 'false';

const DEV_TEST_ROUTE_ID = parseNumber(import.meta.env.VITE_DEV_TEST_ROUTE_ID);

// ── 루트 선택지 정규화 ─────────────────────────────────────

export const normalizeRouteOption = (rawRoute, overrides = {}) => {
  const routeId = rawRoute.routeId ?? rawRoute.id;
  const sourceType = overrides.sourceType ?? rawRoute.sourceType ?? 'MY_ROUTE';
  const sourceLabel =
    overrides.sourceLabel ??
    rawRoute.sourceLabel ??
    (sourceType === 'MY_ROUTE' ? '내 루트' : '북마크한 루트');

  const rawSpots = rawRoute.spots ?? rawRoute.routeSpots ?? [];

  const spots = rawSpots.map((rawSpot, index) => {
    const spot = rawSpot.spot ?? rawSpot;

    return {
      spotId: spot.spotId ?? spot.id ?? null,
      name: spot.name ?? spot.spotName ?? `장소 ${index + 1}`,
      artworkTitle: spot.artworkTitle ?? spot.workName ?? spot.artworkName ?? '작품 정보 미정',
      address: spot.address ?? '',
      latitude: parseNumber(spot.latitude ?? spot.position?.lat),
      longitude: parseNumber(spot.longitude ?? spot.position?.lng),
      sceneImageUrl:
        spot.sceneImageUrl ??
        spot.sceneImgUrl ??
        spot.placePhotoUrl ??
        spot.originalSceneImageUrl ??
        null,
    };
  });

  // route 응답이 artworkTagNames/artworkTagName을 직접 내려주면 그것을 우선 사용하고,
  // 아직 백엔드가 과도기라면 각 spot의 artworkTitle을 묶어서 route 태그 목록으로 복원합니다.
  const artworkTagNames = normalizeTagNames(
    rawRoute.artworkTagNames ??
      rawRoute.artworkTagName ??
      spots.map((spot) => spot.artworkTitle),
  );

  return {
    id: String(routeId),
    routeId,
    sourceType,
    sourceLabel,
    title: rawRoute.title ?? rawRoute.routeTitle ?? `루트 ${routeId}`,
    summary: rawRoute.summary ?? rawRoute.description ?? '루트 설명이 없습니다.',
    ownerDisplayName:
      rawRoute.ownerDisplayName ?? rawRoute.userNickname ?? rawRoute.userId ?? overrides.ownerDisplayName ?? '익명',
    bookmarkName: overrides.bookmarkName ?? rawRoute.bookmarkName ?? null,
    bookmarkedPostTitle: overrides.bookmarkedPostTitle ?? rawRoute.bookmarkedPostTitle ?? null,
    artworkTagName: artworkTagNames[0] ?? null,
    artworkTagNames,
    tagNames: artworkTagNames,
    spots,
  };
};

// ── 북마크 pins 기반 최소 루트 복원 ────────────────────────

export const normalizeBookmarkedRouteFromPins = (bookmark) => {
  const routeId = bookmark?.routeId ?? null;
  const rawPins = Array.isArray(bookmark?.pins) ? bookmark.pins : [];
  if (routeId == null || rawPins.length === 0) {
    return null;
  }

  const spots = rawPins.map((pin, index) => ({
    spotId: pin?.id ?? pin?.spotId ?? null,
    name: pin?.name ?? pin?.buildingName ?? `장소 ${index + 1}`,
    artworkTitle:
      pin?.artwork?.title ??
      pin?.artworkTitle ??
      pin?.workName ??
      pin?.artworkName ??
      '작품 정보 미정',
    address: pin?.address ?? '',
    latitude: parseNumber(pin?.latitude ?? pin?.position?.lat),
    longitude: parseNumber(pin?.longitude ?? pin?.position?.lng),
    sceneImageUrl:
      pin?.sceneImageUrl ??
      pin?.sceneImgUrl ??
      pin?.artwork?.posterUrl ??
      null,
  }));

  const artworkTagNames = normalizeTagNames(spots.map((spot) => spot.artworkTitle));
  const title =
    String(bookmark?.routeTitle ?? '').trim() ||
    String(bookmark?.bookmarkName ?? '').trim() ||
    `북마크 루트 ${routeId}`;

  return {
    id: `bookmark-route-${routeId}`,
    routeId,
    sourceType: 'BOOKMARKED_ROUTE',
    sourceLabel: '북마크한 루트',
    title,
    summary: `북마크에서 복원한 루트입니다. 장소 ${spots.length}개`,
    ownerDisplayName: '북마크',
    bookmarkName: bookmark?.bookmarkName ?? null,
    bookmarkedPostTitle: null,
    artworkTagName: artworkTagNames[0] ?? null,
    artworkTagNames,
    tagNames: artworkTagNames,
    spots,
  };
};

// ── 공개 게시물 상세 기반 루트 복원 ────────────────────────

export const normalizeBookmarkedRouteFromPostDetail = (postResponse, bookmark) => {
  const detail = toRoutePostDetail(postResponse, []);
  if (!detail?.routeId) {
    return null;
  }

  const spots = (detail.entries ?? []).map((entry) => ({
    spotId: entry?.spotId ?? null,
    name: entry?.title ?? entry?.name ?? '장소 정보 미정',
    artworkTitle: entry?.artworkTitle ?? '작품 정보 미정',
    address: entry?.address ?? '',
    latitude: parseNumber(entry?.lat ?? entry?.latitude),
    longitude: parseNumber(entry?.lng ?? entry?.longitude),
    sceneImageUrl: entry?.referenceImageUrl ?? entry?.sceneImageUrl ?? null,
  }));

  const artworkTagNames = normalizeTagNames(
    detail.tagNames?.length > 0 ? detail.tagNames : spots.map((spot) => spot.artworkTitle),
  );

  return {
    id: `bookmark-route-${detail.routeId}`,
    routeId: detail.routeId,
    sourceType: 'BOOKMARKED_ROUTE',
    sourceLabel: '북마크한 루트',
    title: detail.routeTitle ?? detail.title ?? bookmark?.bookmarkName ?? `북마크 루트 ${detail.routeId}`,
    summary: detail.summary ?? `북마크 게시물에서 복원한 루트입니다. 장소 ${spots.length}개`,
    ownerDisplayName: detail.author?.name ?? '익명',
    bookmarkName: bookmark?.bookmarkName ?? null,
    bookmarkedPostTitle: detail.title ?? null,
    artworkTagName: artworkTagNames[0] ?? null,
    artworkTagNames,
    tagNames: artworkTagNames,
    spots,
  };
};

// ── 개발 목업 루트 빌더 ────────────────────────────────────

export const buildDevMockRoutes = () => {
  const normalized = MOCK_POST_CREATE_ROUTES.map((route, index) => ({
    ...normalizeRouteOption(route, {
      sourceType: 'MY_ROUTE',
      sourceLabel: '테스트 목업 루트',
    }),
    id: `dev-mock-route-${index}-${route.routeId ?? route.id ?? Date.now()}`,
    isDevMock: true,
  }));

  if (DEV_TEST_ROUTE_ID == null || normalized.length === 0) {
    return normalized;
  }

  const [first, ...rest] = normalized;
  return [
    {
      ...first,
      routeId: DEV_TEST_ROUTE_ID,
      title: `[DEV] 백엔드 연동 테스트 루트 (routeId=${DEV_TEST_ROUTE_ID})`,
      summary: '실제 routeId를 주입한 목업 루트입니다. JSON 생성 연동 테스트에 사용하세요.',
    },
    ...rest,
  ];
};

// ── 유틸리티 ───────────────────────────────────────────────

export const dedupeRoutes = (routes) =>
  Array.from(new Map(routes.filter(Boolean).map((route) => [String(route.id), route])).values());

// ── JSON 생성 payload 빌더 ─────────────────────────────────

export const buildRouteCreatePayload = ({ selectedRoute, title, selectedTags = [], entries }) => {
  const routeTagNames = normalizeTagNames(
    selectedRoute?.artworkTagNames ?? selectedRoute?.tagNames ?? selectedRoute?.artworkTagName,
  );
  const resolvedTagNames = normalizeTagNames(selectedTags).length > 0 ? normalizeTagNames(selectedTags) : routeTagNames;

  const payloadEntries = entries.map((entry, index) => {
    const representativePhoto = entry.experiencePhotos?.[0] ?? null;

    return {
      entryId: entry.id,
      spotId: entry.spotId ?? null,
      name: entry.name?.trim() ?? '',
      artworkTitle: entry.artworkTitle?.trim() ?? '',
      address: entry.address?.trim() ?? '',
      latitude: parseNumber(entry.latitude),
      longitude: parseNumber(entry.longitude),
      sortOrder: entry.sortOrder ?? index,
      referenceImageUrl: resolvePersistableReferenceImageUrl(entry),
      userImageUrl: resolvePersistableUserImageUrl(entry),
      note: representativePhoto?.note?.trim() ?? '',
    };
  });

  const payloadImages = payloadEntries
    .map((entry, index) => ({
      imageUrl: entry.userImageUrl,
      sortOrder: index + 1,
      exifLatitude: entry.latitude,
      exifLongitude: entry.longitude,
    }))
    .filter((image) => Boolean(image.imageUrl));

  const thumbnailUrl =
    payloadEntries.find((entry) => entry.userImageUrl)?.userImageUrl ??
    payloadEntries.find((entry) => entry.referenceImageUrl)?.referenceImageUrl ??
    '';

  const content = payloadEntries
    .map((entry) => ({
      placeName: entry.name,
      experience: entry.note,
    }))
    .filter((entry) => entry.experience)
    .map((entry) => `${entry.experience}`)
    .join('\n\n')
    .trim();

  const post = {
    routeId: selectedRoute?.routeId ?? null,
    title: title.trim(),
    content: content,
    status: 'PUBLIC',
    tagNames: resolvedTagNames,
    thumbnailUrl,
    images: payloadImages,
    imageUrl: payloadImages.map((image) => image.imageUrl),
    entries: payloadEntries,
  };

  return post;
};

// ── 작성 페이지 루트 로딩 ──────────────────────────────────

export const loadPostCreateRoutes = async (userId) => {
  const resolvedUserId = resolveUserIdForRouteQuery(userId);
  const issues = [];
  const collected = [];

  const routeListEndpoints = [
    resolvedUserId ? appendUserIdQuery('/api/v1/map/routes', resolvedUserId) : null,
    '/api/v1/routes/my',
    resolvedUserId ? appendUserIdQuery('/api/v1/user/routes', resolvedUserId) : null,
    '/api/v1/user/myRoute',
  ].filter(Boolean);

  let myRoutesLoaded = false;
  for (const endpoint of routeListEndpoints) {
    try {
      const response = await FetchJson(endpoint);
      const routeList = extractArrayPayload(response);
      if (routeList.length > 0) {
        collected.push(
          ...routeList.map((route) =>
            normalizeRouteOption(route, {
              sourceType: 'MY_ROUTE',
              sourceLabel: '내 루트',
            }),
          ),
        );
      }
      myRoutesLoaded = true;
      break;
    } catch {
      // 다음 후보 endpoint로 재시도
    }
  }

  if (!myRoutesLoaded) {
    issues.push('내 루트 조회 API 응답을 확인하지 못했습니다.');
  }

  try {
    const bookmarks = await fetchBookmarksWithFallback({
      fetchJson: FetchJson,
      userId: resolvedUserId,
    });
    const routeBookmarks = bookmarks.filter((bookmark) => bookmark?.routeId != null);

    for (const bookmark of routeBookmarks) {
      const routeId = bookmark.routeId;
      const fastResolved = normalizeBookmarkedRouteFromPins(bookmark);

      if (fastResolved) {
        collected.push(fastResolved);
        continue;
      }

      const routeDetailEndpoints = [
        resolvedUserId ? appendUserIdQuery(`/api/v1/map/routes/${routeId}`, resolvedUserId) : null,
        `/api/v1/routes/${routeId}`,
        resolvedUserId ? appendUserIdQuery(`/api/v1/user/routes/${routeId}`, resolvedUserId) : null,
      ].filter(Boolean);

      let resolved = null;
      for (const endpoint of routeDetailEndpoints) {
        try {
          const detail = await FetchJson(endpoint);
          resolved = normalizeRouteOption(detail, {
            sourceType: 'BOOKMARKED_ROUTE',
            sourceLabel: '북마크한 루트',
            bookmarkName: bookmark.bookmarkName,
          });
          break;
        } catch {
          // 다음 후보 endpoint로 재시도
        }
      }

      if (resolved) {
        collected.push(resolved);
      } else {
        let fallbackRoute = null;

        if (bookmark?.postId != null) {
          try {
            const bookmarkedPost = await FetchJson(`/api/v1/posts/${bookmark.postId}`);
            fallbackRoute = normalizeBookmarkedRouteFromPostDetail(bookmarkedPost, bookmark);
          } catch {
            // 공개 게시물 상세도 실패하면 pins fallback으로 한번 더 시도합니다.
          }
        }

        if (!fallbackRoute) {
          fallbackRoute = normalizeBookmarkedRouteFromPins(bookmark);
        }

        if (fallbackRoute) {
          collected.push(fallbackRoute);
          issues.push(`북마크 루트 ${routeId} 상세 조회는 실패했지만, 북마크 데이터로 복원했습니다.`);
        } else {
          issues.push(`북마크 루트 ${routeId} 상세 조회에 실패했습니다.`);
        }
      }
    }
  } catch {
    issues.push('북마크 목록 조회 API 응답을 확인하지 못했습니다.');
  }

  if (collected.length === 0 && ENABLE_POST_CREATE_MOCK_ROUTES) {
    collected.push(...buildDevMockRoutes());
    issues.unshift(
      DEV_TEST_ROUTE_ID == null
        ? '실제 루트가 없어 개발용 목업 루트를 표시합니다. 생성 성공까지 검증하려면 VITE_DEV_TEST_ROUTE_ID에 실제 routeId를 설정하세요.'
        : `실제 루트가 없어 개발용 목업 루트를 표시합니다. 첫 번째 루트는 routeId=${DEV_TEST_ROUTE_ID}로 JSON 전송됩니다.`,
    );
  }

  return {
    routes: dedupeRoutes(collected),
    issues,
  };
};
