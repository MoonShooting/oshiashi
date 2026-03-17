import { FetchJson } from '@/api/FetchClient';
import { MOCK_POST_CREATE_ROUTES } from '@/data/post/postCreateMockData';

/*
[routePostApi - 일반 게시물(루트 게시물) 전용 API]
- 목적: /posts 화면에서 사용하는 목록/상세/게시글 CRUD/댓글 CRUD/좋아요/북마크를 한 곳에서 관리
- 원칙: 백엔드 응답 스키마 차이를 이 계층에서 흡수하고, 화면에는 안정적인 ViewModel만 전달
- 생성 규약: POST /api/v1/posts JSON
  - body: routeId/title/content/status/images[]
  - images[]: imageUrl/sortOrder/exifLatitude/exifLongitude
- 동기화: 데이터 변경 시 route-posts-changed 이벤트를 발행해 목록/홈 미리보기 갱신
*/
const ROUTE_POSTS_UPDATED_EVENT = 'route-posts-changed';

const emitRoutePostsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ROUTE_POSTS_UPDATED_EVENT));
  }
};

// ------------------------------
// 공통 정규화 유틸
// ------------------------------
const parseNumber = (value) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

// route 조회 API는 userId query param을 요구하므로,
// Zustand user가 비어있는 경우에도 저장된 JWT에서 userId(sub) 복구를 시도합니다.
const getStoredAccessToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const resolveUserIdForRouteQuery = (userId) => {
  if (typeof userId === 'string' && userId.trim()) {
    return userId.trim();
  }

  const rawToken = getStoredAccessToken();
  if (!rawToken) return '';

  const token = rawToken.replace(/^Bearer\s+/i, '').trim();
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return '';

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    const tokenUserId = payload?.userId ?? payload?.sub ?? payload?.username ?? '';
    return typeof tokenUserId === 'string' ? tokenUserId.trim() : '';
  } catch {
    return '';
  }
};

// 개발 환경에서 작성용 루트 API가 비어있을 때, 테스트 편의를 위해 목업 루트를 주입할지 결정합니다.
// - 기본값: DEV에서는 true
// - VITE_ENABLE_POST_CREATE_MOCK_ROUTES=false 로 명시하면 비활성화
const ENABLE_POST_CREATE_MOCK_ROUTES =
  import.meta.env.DEV &&
  String(import.meta.env.VITE_ENABLE_POST_CREATE_MOCK_ROUTES ?? 'true').toLowerCase() !== 'false';

// 선택값: 실제 백엔드에 존재하는 routeId를 넣으면 "목업 루트 선택 + 실서버 생성"까지 검증할 수 있습니다.
const DEV_TEST_ROUTE_ID = parseNumber(import.meta.env.VITE_DEV_TEST_ROUTE_ID);

const toDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '-';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const formatTimeLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '-';
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minute}`;
};

const formatRelativeTimeLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))}분 전`;
  }

  if (diffMs < day) {
    return `${Math.max(1, Math.floor(diffMs / hour))}시간 전`;
  }

  if (diffMs < day * 7) {
    return `${Math.max(1, Math.floor(diffMs / day))}일 전`;
  }

  return formatDateLabel(isoString);
};

const buildAvatarLabel = (name = '나') =>
  String(name)
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .slice(0, 2)
    .toUpperCase() || '나';

const normalizeTagList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const extractArrayPayload = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

// 백엔드 응답 래퍼(data/result) 유무와 무관하게 실제 payload 객체를 꺼냅니다.
const unwrapObjectPayload = (response) => {
  if (!response || typeof response !== 'object') return response;
  if (response.data && typeof response.data === 'object') return response.data;
  if (response.result && typeof response.result === 'object') return response.result;
  return response;
};

const resolvePostId = (postResponse) => {
  const payload = unwrapObjectPayload(postResponse);
  return String(payload?.postId ?? payload?.id ?? payload?.post_id ?? '');
};

const resolveRouteId = (postResponse) => {
  const payload = unwrapObjectPayload(postResponse);
  if (!payload) return null;
  if (payload.routeId != null) return payload.routeId;
  if (payload.route_id != null) return payload.route_id;
  if (payload.route?.routeId != null) return payload.route.routeId;
  if (payload.route?.route_id != null) return payload.route.route_id;
  if (payload.route?.id != null) return payload.route.id;
  return null;
};

const normalizeComment = (comment) => {
  const authorName = comment.nickname ?? comment.userName ?? comment.userId ?? '익명';

  return {
    id: String(comment.commentId ?? comment.id ?? ''),
    author: authorName,
    authorId: comment.userId ?? null,
    avatarLabel: buildAvatarLabel(authorName),
    timeLabel: formatRelativeTimeLabel(comment.createdAt),
    createdAt: comment.createdAt,
    content: comment.content ?? '',
  };
};

const normalizeEntry = (entry, index, fallback = {}) => {
  const lat = parseNumber(entry?.lat ?? entry?.latitude ?? entry?.position?.lat ?? fallback.lat);
  const lng = parseNumber(entry?.lng ?? entry?.longitude ?? entry?.position?.lng ?? fallback.lng);

  return {
    id: String(entry?.entryId ?? entry?.id ?? `entry-${index}`),
    title: entry?.title ?? entry?.placeName ?? entry?.name ?? fallback.title ?? `장소 ${index + 1}`,
    artworkTitle:
      entry?.artworkTitle ?? entry?.sceneTitle ?? entry?.workName ?? fallback.artworkTitle ?? '작품 정보 없음',
    address: entry?.address ?? fallback.address ?? '주소 정보 없음',
    lat,
    lng,
    referenceImageUrl:
      entry?.referenceImageUrl ??
      entry?.sceneImageUrl ??
      entry?.originalSceneImageUrl ??
      fallback.referenceImageUrl ??
      '',
    userImageUrl: entry?.userImageUrl ?? entry?.imageUrl ?? fallback.userImageUrl ?? '',
    sceneNote: entry?.sceneNote ?? entry?.experience ?? entry?.note ?? fallback.sceneNote ?? '',
    soundtrack: entry?.soundtrack ?? fallback.soundtrack ?? '기록된 OST 없음',
    visitTimeLabel: entry?.visitTimeLabel ?? fallback.visitTimeLabel ?? '-',
    moodTags: normalizeTagList(entry?.moodTags ?? entry?.tags ?? fallback.moodTags),
  };
};

// entries가 있으면 우선 사용하고,
// 없으면 images 배열을 entries 형태로 승격하고,
// 둘 다 없으면 최소 1개 entry를 만들어 상세 화면이 깨지지 않게 합니다.
const buildEntriesFromPost = (postResponse) => {
  const routeId = resolveRouteId(postResponse);
  const images = extractArrayPayload(postResponse?.images);

  if (Array.isArray(postResponse?.entries) && postResponse.entries.length > 0) {
    return postResponse.entries.map((entry, index) =>
      normalizeEntry(entry, index, {
        visitTimeLabel: formatTimeLabel(postResponse?.createdAt),
      }),
    );
  }

  if (images.length > 0) {
    return images.map((image, index) =>
      normalizeEntry(
        {
          id: image.postImageId,
          imageUrl: image.imageUrl,
          sceneImageUrl: image.sceneImageUrl,
          experience: image.experience,
          latitude: image.exifLatitude,
          longitude: image.exifLongitude,
          tags: postResponse?.tags,
          title: `장소 ${index + 1}`,
          artworkTitle: postResponse?.artworkTitle,
          address: postResponse?.address,
          visitTimeLabel: formatTimeLabel(postResponse?.createdAt),
        },
        index,
      ),
    );
  }

  return [
    normalizeEntry(
      {
        id: 'entry-0',
        title: postResponse?.title,
        experience: postResponse?.content,
        tags: postResponse?.tags,
      },
      0,
      {
        title: postResponse?.routeTitle ?? `루트 ${routeId ?? '-'}`,
        sceneNote: postResponse?.content ?? '',
        visitTimeLabel: formatTimeLabel(postResponse?.createdAt),
      },
    ),
  ];
};

// 상세 화면에서 바로 소비할 수 있는 RoutePostDetail ViewModel로 정규화합니다.
const toRoutePostDetail = (postResponse, comments = []) => {
  const payload = unwrapObjectPayload(postResponse);
  if (!payload) return null;

  const createdAt = payload.createdAt ?? payload.created_at ?? new Date().toISOString();
  const routeId = resolveRouteId(payload);

  const authorId = payload.userId ?? payload.authorId ?? payload.user_id ?? 'anonymous';
  const authorName =
    payload.userNickname ?? payload.userName ?? payload.authorName ?? authorId;

  const normalizedComments = comments.map(normalizeComment);
  const entries = buildEntriesFromPost(payload);

  const locationSummary =
    payload.locationSummary ??
    entries
      .map((entry) => entry.address)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ');

  return {
    id: resolvePostId(payload),
    routeId,
    boardType: payload.boardType ?? 'FREE',
    title: payload.title ?? '',
    summary: payload.summary ?? (payload.content ?? '').slice(0, 120),
    content: payload.content ?? '',
    author: {
      userId: authorId,
      name: authorName,
      avatarLabel: buildAvatarLabel(authorName),
    },
    createdAt,
    publishedDateLabel: formatDateLabel(createdAt),
    publishedTimeLabel: formatTimeLabel(createdAt),
    tags: normalizeTagList(payload.tags),
    routeTitle: payload.routeTitle ?? payload.route?.title ?? `루트 ${routeId ?? '-'}`,
    locationSummary: locationSummary || '위치 정보 없음',
    guideText:
      payload.guideText ??
      '작성자가 남긴 장면 가이드가 아직 없습니다. 댓글에서 방문 팁을 함께 나눠보세요.',
    audioRecommendations: extractArrayPayload(payload.audioRecommendations),
    stats: {
      views: Number(payload.viewCount ?? payload.view_count ?? 0),
      likes: Number(payload.likeCount ?? payload.like_count ?? 0),
    },
    commentCount: Number(payload.commentCount ?? payload.comment_count ?? normalizedComments.length ?? 0),
    comments: normalizedComments,
    entries,
  };
};

// 상세 모델을 카드 목록용 요약 모델로 축소합니다.
const toSummary = (detail) => ({
  id: detail.id,
  routeId: detail.routeId,
  title: detail.title,
  content: detail.summary ?? detail.content,
  userId: detail.author?.name ?? detail.author?.userId ?? '익명',
  viewCount: detail.stats?.views ?? 0,
  likeCount: detail.stats?.likes ?? 0,
  commentCount: detail.commentCount ?? detail.comments?.length ?? 0,
  tags: detail.tags ?? [],
  imageUrl: detail.entries?.[0]?.userImageUrl ?? detail.entries?.[0]?.referenceImageUrl ?? '',
  publishedAt: detail.publishedDateLabel ?? '',
  boardType: detail.boardType ?? 'FREE',
  category: '게시물',
  createdAt: detail.createdAt,
});

// 목록 정렬은 API sort와 무관하게 최종 한번 더 프론트에서 보정합니다.
const sortSummaries = (posts, sortBy = 'latest') => {
  const cloned = [...posts];

  if (sortBy === 'popular') {
    return cloned.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
  }

  if (sortBy === 'views') {
    return cloned.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
  }

  return cloned.sort(
    (a, b) =>
      (toDateOrNull(b.createdAt)?.getTime() ?? 0) - (toDateOrNull(a.createdAt)?.getTime() ?? 0),
  );
};

// ------------------------------
// 루트 선택(작성 페이지) 정규화
// ------------------------------
const normalizeRouteOption = (rawRoute, overrides = {}) => {
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
    spots,
  };
};

// 작성 페이지용 개발 목업 루트 빌더
// - API 루트가 하나도 없을 때만 fallback으로 사용
// - 첫 번째 루트는 VITE_DEV_TEST_ROUTE_ID를 주입할 수 있어 실서버 생성 검증이 쉬워집니다.
const buildDevMockRoutes = () => {
  const normalized = MOCK_POST_CREATE_ROUTES.map((route, index) => ({
    ...normalizeRouteOption(route, {
      sourceType: 'MY_ROUTE',
      sourceLabel: '테스트 목업 루트',
    }),
    // 실제 데이터와 충돌하지 않도록 프론트 선택 id는 dev 접두사로 분리
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

const dedupeRoutes = (routes) =>
  Array.from(new Map(routes.filter(Boolean).map((route) => [String(route.id), route])).values());

const appendUserIdQuery = (endpoint, userId) => {
  if (!userId) return endpoint;
  const delimiter = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${delimiter}userId=${encodeURIComponent(userId)}`;
};

// JSON 생성 payload 빌더:
// - 백엔드 계약(PostCreateRequest)에 맞춰 images[]만 전송
// - 이미지 파일 자체는 보내지 않고 imageUrl 문자열만 보냅니다.
const buildRouteCreatePayload = ({ selectedRoute, title, entries }) => {
  const payloadImages = entries
    .map((entry, index) => {
      const representativePhoto = entry.experiencePhotos?.[0] ?? null;
      if (!representativePhoto) return null;

      // 현재 작성 UI는 로컬 파일 선택 중심이므로, URL 계약을 맞추기 위해
      // 우선순위를 두고 imageUrl 후보를 선택합니다.
      // 1) 대표사진 미리보기 URL(blob:...)
      // 2) 참고 이미지 URL
      // 3) 루트 장면 URL
      const imageUrl =
        representativePhoto.previewUrl ??
        entry.referenceImageUrl ??
        entry.sceneImageUrl ??
        '';

      return {
        imageUrl,
        sortOrder: index + 1,
        exifLatitude: parseNumber(entry.latitude),
        exifLongitude: parseNumber(entry.longitude),
      };
    })
    .filter((image) => Boolean(image?.imageUrl));

  const content = entries
    .map((entry) => {
      const representativePhoto = entry.experiencePhotos?.[0] ?? null;
      return {
        placeName: entry.name?.trim() ?? '',
        experience: representativePhoto?.note?.trim() ?? '',
      };
    })
    .filter((entry) => entry.experience)
    .map((entry) => `${entry.placeName || '장소'}: ${entry.experience}`)
    .join('\n\n')
    .trim();

  const post = {
    routeId: selectedRoute?.routeId ?? null,
    title: title.trim(),
    content: content || title.trim(),
    status: 'PUBLIC',
    images: payloadImages,
  };

  return post;
};

const normalizeBookmark = (bookmark) => ({
  bookmarkId: String(bookmark?.bookmarkId ?? bookmark?.id ?? ''),
  bookmarkName: bookmark?.bookmarkName ?? '',
  postId: String(bookmark?.postId ?? ''),
});

// 북마크 목록 endpoint가 환경마다 다를 수 있어 후보 endpoint 순서대로 시도합니다.
const fetchBookmarksList = async ({ userId } = {}) => {
  const endpoints = [
    '/api/v1/user/myBookmarks',
    userId ? appendUserIdQuery('/api/v1/user/bookmarks', userId) : null,
  ].filter(Boolean);

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await FetchJson(endpoint);
      return extractArrayPayload(response);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};

/*
[목록 조회]
- routeIdIsNull=false로 일반 게시물만 조회
- 검색/태그/정렬을 query로 전달
- 최종적으로 카드 ViewModel 배열 반환
*/
export const fetchRoutePosts = async ({ tags = [], search = '', sortBy = 'latest' } = {}) => {
  const params = new URLSearchParams();
  params.set('routeIdIsNull', 'false');
  params.set('sort', sortBy);

  const normalizedSearch = search.trim();
  if (normalizedSearch) {
    params.set('search', normalizedSearch);
  }

  if (tags.length > 0) {
    params.set('tags', tags.join(','));
  }

  const response = await FetchJson(`/api/v1/posts?${params.toString()}`);

  const normalizedTags = tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean);

  const summaries = extractArrayPayload(response)
    .map((item) => toRoutePostDetail(item, []))
    .filter((item) => item && item.routeId != null && item.id)
    .map(toSummary)
    .filter((item) => {
      if (normalizedTags.length === 0) return true;
      const lowerTags = (item.tags ?? []).map((tag) => String(tag).toLowerCase());
      return normalizedTags.every((tag) => lowerTags.includes(tag));
    });

  return sortSummaries(summaries, sortBy);
};

// 상세 + 댓글을 함께 조회해 상세 페이지 모델 하나로 반환합니다.
export const fetchRoutePostById = async (postId) => {
  const [postResponse, rawComments] = await Promise.all([
    FetchJson(`/api/v1/posts/${postId}`),
    FetchJson(`/api/v1/posts/${postId}/comments`).catch(() => []),
  ]);

  if (resolveRouteId(postResponse) == null) {
    return null;
  }

  return toRoutePostDetail(postResponse, extractArrayPayload(rawComments));
};

/*
[작성 페이지 루트 로딩]
- 내 루트 목록 endpoint 후보를 순차 시도
- 북마크 루트는 bookmark -> route detail 조회로 확장
- 실패 항목은 issues에 모아 화면에서 배너로 노출
*/
export const loadPostCreateRoutes = async (userId) => {
  const resolvedUserId = resolveUserIdForRouteQuery(userId);
  const issues = [];
  const collected = [];

  const routeListEndpoints = [
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
    const bookmarks = await fetchBookmarksList({ userId: resolvedUserId });
    const routeBookmarks = bookmarks.filter((bookmark) => bookmark?.routeId != null);

    for (const bookmark of routeBookmarks) {
      const routeId = bookmark.routeId;
      const routeDetailEndpoints = [
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
        issues.push(`북마크 루트 ${routeId} 상세 조회에 실패했습니다.`);
      }
    }
  } catch {
    issues.push('북마크 목록 조회 API 응답을 확인하지 못했습니다.');
  }

  // 실제 루트가 비어 있으면 개발 목업 루트를 fallback으로 제공해
  // 작성/업로드/JSON 전송 흐름을 바로 점검할 수 있게 합니다.
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

/*
[게시글 생성 - JSON]
- /api/v1/posts에 routeId/title/content/status/images[]를 JSON으로 전송
- 생성 후 가능하면 상세 재조회로 화면 데이터 완성도 보장
*/
export const createRoutePost = async ({ selectedRoute, title, entries }) => {
  const post = buildRouteCreatePayload({ selectedRoute, title, entries });

  const response = await FetchJson('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
  const payload = unwrapObjectPayload(response);

  emitRoutePostsUpdated();

  const createdPostId = resolvePostId(payload);
  if (createdPostId) {
    try {
      return await fetchRoutePostById(createdPostId);
    } catch {
      return toRoutePostDetail(payload, []);
    }
  }

  return toRoutePostDetail(payload, []);
};

// 수정/삭제 후 목록 반영을 위해 route-posts-changed 이벤트를 발행합니다.
export const updateRoutePost = async ({ postId, title, content }) => {
  await FetchJson(`/api/v1/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title, content }),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

export const deleteRoutePost = async ({ postId }) => {
  await FetchJson(`/api/v1/posts/${postId}`, {
    method: 'DELETE',
  });

  emitRoutePostsUpdated();
};

// 댓글 변경은 상세를 재조회해 개수/상대시간 등을 서버 상태로 동기화합니다.
export const createRouteComment = async ({ postId, content }) => {
  await FetchJson(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

export const updateRouteComment = async ({ postId, commentId, content }) => {
  await FetchJson(`/api/v1/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

export const deleteRouteComment = async ({ postId, commentId }) => {
  await FetchJson(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

// 좋아요 토글은 서버 결과를 신뢰하고 상세를 다시 받아옵니다.
export const likeRoutePost = async ({ postId }) => {
  await FetchJson(`/api/v1/posts/${postId}/like`, {
    method: 'POST',
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

export const fetchMyPostBookmarks = async ({ userId } = {}) => {
  const bookmarks = await fetchBookmarksList({ userId });

  return bookmarks
    .filter((bookmark) => bookmark?.postId != null)
    .map(normalizeBookmark)
    .filter((bookmark) => bookmark.bookmarkId && bookmark.postId);
};

// 북마크 생성 응답이 비어있는(204 등) 경우를 대비해 목록 재조회로 최종 상태를 보정합니다.
export const createPostBookmark = async ({ postId, userId, bookmarkName }) => {
  const endpoint = appendUserIdQuery('/api/v1/bookmarks', userId);

  const response = await FetchJson(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      bookmarkName,
      postId,
      routeId: null,
      postImageId: null,
    }),
  });

  // 중복 북마크 등으로 204를 받을 수 있어 목록 재조회로 최종 상태를 맞춥니다.
  if (!response) {
    const bookmarks = await fetchMyPostBookmarks({ userId });
    return bookmarks.find((bookmark) => String(bookmark.postId) === String(postId)) ?? null;
  }

  emitRoutePostsUpdated();
  return normalizeBookmark(response);
};

export const deletePostBookmark = async ({ bookmarkId, userId }) => {
  const endpoint = appendUserIdQuery(`/api/v1/bookmarks/${bookmarkId}`, userId);

  await FetchJson(endpoint, {
    method: 'DELETE',
  });

  emitRoutePostsUpdated();
};

export const routePostsUpdatedEvent = ROUTE_POSTS_UPDATED_EVENT;
