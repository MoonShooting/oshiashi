import { FetchJson } from '@/api/FetchClient';
import {
  appendUserIdQuery,
  buildAvatarLabel,
  extractArrayPayload,
  fetchBookmarksWithFallback,
  formatDateLabel,
  formatRelativeTimeLabel,
  formatTimeLabel,
  normalizeBookmark,
  toDateOrNull,
} from '@/api/postApiShared';
import { MOCK_POST_CREATE_ROUTES } from '@/data/post/postCreateMockData';

/*
[routePostApi - 일반 게시물(루트 게시물) 전용 API]
- 목적: /posts 화면에서 사용하는 목록/상세/게시글 CRUD/댓글 CRUD/좋아요/북마크를 한 곳에서 관리
- 원칙: 백엔드 응답 스키마 차이를 이 계층에서 흡수하고, 화면에는 안정적인 ViewModel만 전달
- 생성 규약: POST /api/v1/posts JSON
  - body: routeId/title/content/status/thumbnailUrl/images[]/entries[]
  - 파일 자체는 별도 업로드 API에서 URL을 먼저 발급받은 뒤 JSON에 포함
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
  if (value === null || value === undefined || value === '') return null;
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

const normalizeTagNames = (value) =>
  Array.from(
    new Set(
      normalizeTagList(value)
        .map((item) => item.replace(/^#/, '').trim())
        .filter(Boolean),
    ),
  );

const isPersistableImageUrl = (value) =>
  typeof value === 'string' && value.trim().length > 0 && !value.startsWith('blob:');

const resolvePersistableUserImageUrl = (entry) => {
  const representativePhoto = entry?.experiencePhotos?.[0] ?? null;
  // 대표 사진은 업로드 완료 URL만 저장 대상으로 인정합니다.
  // blob 미리보기나 임시 값은 여기서 걸러야 백엔드에 로컬 URL이 섞이지 않습니다.
  const candidates = [representativePhoto?.uploadedUrl, representativePhoto?.imageUrl];
  return candidates.find(isPersistableImageUrl) ?? '';
};

const resolvePersistableReferenceImageUrl = (entry) => {
  // 참고 이미지는 사용자가 직접 올린 referenceImageUrl이 우선이고,
  // 없으면 기존 spot의 sceneImageUrl을 fallback으로 사용합니다.
  const candidates = [entry?.referenceImageUrl, entry?.sceneImageUrl];
  return candidates.find(isPersistableImageUrl) ?? '';
};

const resolvePostTagNames = (postResponse) =>
  normalizeTagNames(
    unwrapObjectPayload(postResponse)?.tagNames ??
      unwrapObjectPayload(postResponse)?.artworkTagNames ??
      unwrapObjectPayload(postResponse)?.artworkTagName,
  );

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
    moodTags: normalizeTagList(entry?.moodTags ?? entry?.tagNames ?? fallback.moodTags),
  };
};

// entries가 있으면 우선 사용하고,
// 없으면 images 배열을 entries 형태로 승격하고,
// 둘 다 없으면 최소 1개 entry를 만들어 상세 화면이 깨지지 않게 합니다.
const buildEntriesFromPost = (postResponse) => {
  const routeId = resolveRouteId(postResponse);

  // 백엔드가 과도기일 수 있어 images 또는 imageUrl 둘 다 허용합니다.
  // entries가 아직 없더라도 상세 화면이 최대한 유지되게 하는 호환 계층입니다.
  const images =
    extractArrayPayload(postResponse?.images).length > 0
      ? extractArrayPayload(postResponse?.images)
      : Array.isArray(postResponse?.imageUrl)
        ? postResponse.imageUrl.map((imageUrl, index) => ({
            postImageId: `image-${index}`,
            imageUrl,
          }))
        : [];
  const postTagNames = resolvePostTagNames(postResponse);

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
          tagNames: postTagNames,
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
        tagNames: postTagNames,
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
  const postTagNames = resolvePostTagNames(payload);

  // 목록/마이페이지는 1장짜리 대표 이미지가 있으면 가장 안정적이므로
  // 명시적 thumbnailUrl이 없을 때만 entry 첫 장을 fallback으로 사용합니다.
  const thumbnailUrl =
    payload.thumbnailUrl ??
    payload.thumbnail_url ??
    entries[0]?.userImageUrl ??
    entries[0]?.referenceImageUrl ??
    '';

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
    tagNames: postTagNames,
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
    thumbnailUrl,
    entries,
  };
};

// 북마크 대상이 "게시물"일 때는 route detail API가 막혀도
// 공개 게시물 상세(/api/v1/posts/{postId})에서 routeId와 entries를 읽어 루트를 복원할 수 있습니다.
// 여기서 중요한 점은:
// 1) 게시물 상세는 공개 API라서 루트 소유자와 무관하게 접근 가능하고
// 2) entries 안에 작성 페이지가 바로 소비할 수 있는 장소 정보가 이미 담겨 있다는 것입니다.
// 즉 "북마크 -> 게시물 상세 -> 작성용 route option"으로 우회해
// 남의 게시물을 북마크한 경우에도 장소 카드 생성이 끊기지 않게 합니다.
const normalizeBookmarkedRouteFromPostDetail = (postResponse, bookmark) => {
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
  tagNames: detail.tagNames ?? [],
  imageUrl:
    detail.thumbnailUrl ?? detail.entries?.[0]?.userImageUrl ?? detail.entries?.[0]?.referenceImageUrl ?? '',
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

  // route 응답이 artworkTagNames/artworkTagName을 직접 내려주면 그것을 우선 사용하고,
  // 아직 백엔드가 과도기라면 각 spot의 artworkTitle을 묶어서 route 태그 목록으로 복원합니다.
  // 이렇게 두면 작성 페이지가 별도 수동 태그 입력 없이도 route 기반 tagNames를 안정적으로 만들 수 있습니다.
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

// 북마크 응답은 post/route 구분 없이 routeId와 pins를 함께 내려줄 수 있습니다.
// pins는 "북마크 진입 직후 지도에 바로 그릴 수 있게 만든 최소 장소 요약"이라서,
// route 상세 재조회가 실패하더라도 작성 페이지의 route option 정도는 충분히 복원할 수 있습니다.
// 이 함수는 가장 마지막 안전망 역할을 합니다.
// 우선순위는 "route detail -> 공개 게시물 상세 -> 북마크 pins" 이고,
// 앞 단계가 모두 실패해도 북마크 응답만 남아 있으면 장소 목록을 최대한 살리는 목적입니다.
const normalizeBookmarkedRouteFromPins = (bookmark) => {
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

// JSON 생성 payload 빌더:
// - 이미지는 사전 업로드 후 반환받은 URL만 전송합니다.
// - entries 배열을 함께 보내면 상세 화면이 spot 단위로 복원됩니다.
const buildRouteCreatePayload = ({ selectedRoute, title, selectedTags = [], entries }) => {
  const routeTagNames = normalizeTagNames(
    selectedRoute?.artworkTagNames ?? selectedRoute?.tagNames ?? selectedRoute?.artworkTagName,
  );
  const resolvedTagNames = normalizeTagNames(selectedTags).length > 0 ? normalizeTagNames(selectedTags) : routeTagNames;

  const payloadEntries = entries.map((entry, index) => {
    const representativePhoto = entry.experiencePhotos?.[0] ?? null;

    // 프론트가 수집한 입력 상태를 "백엔드가 그대로 저장하기 쉬운 평면 DTO"로 바꿉니다.
    // 상세 페이지가 필요한 값(name/address/userImageUrl/note)을 이 단계에서 명시적으로 맞춥니다.
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

  // 기존 post_image 구조도 계속 쓸 수 있게 대표 사진 목록을 별도로 만듭니다.
  const payloadImages = payloadEntries
    .map((entry, index) => ({
      imageUrl: entry.userImageUrl,
      sortOrder: index + 1,
      exifLatitude: entry.latitude,
      exifLongitude: entry.longitude,
    }))
    .filter((image) => Boolean(image.imageUrl));

  // 대표 썸네일은 "내 사진 우선, 없으면 참고 이미지" 규칙으로 고정합니다.
  const thumbnailUrl =
    payloadEntries.find((entry) => entry.userImageUrl)?.userImageUrl ??
    payloadEntries.find((entry) => entry.referenceImageUrl)?.referenceImageUrl ??
    '';

  // 본문은 별도 에디터 대신 장소별 감상 노트를 이어 붙여 생성합니다.
  // 백엔드가 entries를 저장하지 못하더라도 최소한 텍스트 본문은 남게 하려는 fallback입니다.
  const content = payloadEntries
    .map((entry) => ({
      placeName: entry.name,
      experience: entry.note,
    }))
    .filter((entry) => entry.experience)
    .map((entry) => `${entry.placeName || '장소'}: ${entry.experience}`)
    .join('\n\n')
    .trim();

  const post = {
    routeId: selectedRoute?.routeId ?? null,
    title: title.trim(),
    content: title.trim(),
    status: 'PUBLIC',
    // 작성 페이지는 수동 태그 UI를 제거했으므로,
    // explicit selectedTags가 비어 있으면 route 자체가 들고 있던 작품 태그를 그대로 tagNames에 사용합니다.
    tagNames: resolvedTagNames,
    thumbnailUrl,
    images: payloadImages,
    imageUrl: payloadImages.map((image) => image.imageUrl),
    entries: payloadEntries,
  };

  return post;
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
      const lowerTags = (item.tagNames ?? []).map((tag) => String(tag).toLowerCase());
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
- 북마크 루트는 bookmark -> post/route 복원 순서로 확장
- 실패 항목은 issues에 모아 화면에서 배너로 노출
*/
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
        // 1순위: 현재 백엔드가 실제로 사용하는 route 상세 계약
        // 북마크 응답의 routeId를 정식 route payload로 확장할 때 가장 먼저 시도합니다.
        resolvedUserId ? appendUserIdQuery(`/api/v1/map/routes/${routeId}`, resolvedUserId) : null,
        // 2, 3순위: 과거/과도기 경로 호환
        // 환경마다 서버가 다른 버전으로 떠 있을 수 있어 fallback을 남겨 둡니다.
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
        // route detail이 모두 실패하면 "북마크가 게시물을 가리키는지"를 먼저 본다.
        // 게시물 북마크라면 공개 게시물 상세에서 route entries를 복원할 수 있으므로
        // pins fallback보다 더 풍부한 데이터를 얻을 가능성이 높다.
        let fallbackRoute = null;

        if (bookmark?.postId != null) {
          try {
            const bookmarkedPost = await FetchJson(`/api/v1/posts/${bookmark.postId}`);
            fallbackRoute = normalizeBookmarkedRouteFromPostDetail(bookmarkedPost, bookmark);
          } catch {
            // 공개 게시물 상세도 실패하면 pins fallback으로 한번 더 시도합니다.
          }
        }

        // 공개 게시물 상세에서도 못 살리면, 마지막으로 북마크 응답의 pins를 사용한다.
        // 이 경우 정보량은 적지만 최소한 "장소 수 / 작품 제목 / 좌표" 수준은 유지할 수 있다.
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
- /api/v1/posts에 routeId/title/content/status/tagNames/images[]를 JSON으로 전송
- 생성 후 가능하면 상세 재조회로 화면 데이터 완성도 보장
*/
export const createRoutePost = async ({ selectedRoute, title, selectedTags = [], entries }) => {
  // 페이지 계층에서 수집한 selectedTags를 최종 전송 규격 tagNames로 변환하는 지점입니다.
  const post = buildRouteCreatePayload({ selectedRoute, title, selectedTags, entries });

  const response = await FetchJson('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
  const payload = unwrapObjectPayload(response);

  emitRoutePostsUpdated();

  const createdPostId = resolvePostId(payload);
  if (createdPostId) {
    // 생성 직후에는 백엔드가 이미 필요한 기본 응답을 내려주므로
    // 무거운 상세/댓글 재조회 없이 바로 화면 모델로 변환합니다.
    return toRoutePostDetail(payload, []);
  }

  return toRoutePostDetail(payload, []);
};

// 수정/삭제 후 목록 반영을 위해 route-posts-changed 이벤트를 발행합니다.
export const updateRoutePost = async ({ postId, title, content ,userId }) => {
  await FetchJson(`/api/v1/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title, content , userId}),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

export const deleteRoutePost = async ({ postId,userId}) => {
  await FetchJson(`/api/v1/posts/${postId}?userId=${userId}`, {
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
  const bookmarks = await fetchBookmarksWithFallback({ fetchJson: FetchJson, userId });

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
