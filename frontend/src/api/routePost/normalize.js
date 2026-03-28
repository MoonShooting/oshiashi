/*
[normalize - 응답 정규화 유틸리티]
- 백엔드 응답 스키마 차이를 흡수하고, 화면에는 안정적인 ViewModel만 전달합니다.
- toRoutePostDetail: 상세 페이지용 ViewModel
- toSummary: 카드 목록용 요약 ViewModel
- normalizeComment: 댓글 ViewModel
- normalizeEntry: 장소 엔트리 ViewModel
*/

import {
  buildAvatarLabel,
  extractArrayPayload,
  formatDateLabel,
  formatRelativeTimeLabel,
  formatTimeLabel,
  toDateOrNull,
} from '@/api/postApiShared';

// ── 기본 파싱 ────────────────────────────────────────────

export const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

export const normalizeTagList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

export const normalizeTagNames = (value) =>
  Array.from(
    new Set(
      normalizeTagList(value)
        .map((item) => item.replace(/^#/, '').trim())
        .filter(Boolean),
    ),
  );

// ── 응답 래퍼 해제 ──────────────────────────────────────

export const unwrapObjectPayload = (response) => {
  if (!response || typeof response !== 'object') return response;
  if (response.data && typeof response.data === 'object') return response.data;
  if (response.result && typeof response.result === 'object') return response.result;
  return response;
};

// ── ID 추출 ─────────────────────────────────────────────

export const resolvePostId = (postResponse) => {
  const payload = unwrapObjectPayload(postResponse);
  return String(payload?.postId ?? payload?.id ?? payload?.post_id ?? '');
};

export const resolveRouteId = (postResponse) => {
  const payload = unwrapObjectPayload(postResponse);
  if (!payload) return null;
  if (payload.routeId != null) return payload.routeId;
  if (payload.route_id != null) return payload.route_id;
  if (payload.route?.routeId != null) return payload.route.routeId;
  if (payload.route?.route_id != null) return payload.route.route_id;
  if (payload.route?.id != null) return payload.route.id;
  return null;
};

const resolvePostTagNames = (postResponse) =>
  normalizeTagNames(
    unwrapObjectPayload(postResponse)?.tagNames ??
      unwrapObjectPayload(postResponse)?.artworkTagNames ??
      unwrapObjectPayload(postResponse)?.artworkTagName,
  );

// ── 이미지 URL 해석 ─────────────────────────────────────

const isPersistableImageUrl = (value) =>
  typeof value === 'string' && value.trim().length > 0 && !value.startsWith('blob:');

export const resolvePersistableUserImageUrl = (entry) => {
  const representativePhoto = entry?.experiencePhotos?.[0] ?? null;
  const candidates = [representativePhoto?.uploadedUrl, representativePhoto?.imageUrl];
  return candidates.find(isPersistableImageUrl) ?? '';
};

export const resolvePersistableReferenceImageUrl = (entry) => {
  const candidates = [entry?.referenceImageUrl, entry?.sceneImageUrl];
  return candidates.find(isPersistableImageUrl) ?? '';
};

// ── 댓글 정규화 ─────────────────────────────────────────

export const normalizeComment = (comment) => {
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

// ── 장소 엔트리 정규화 ──────────────────────────────────

export const normalizeEntry = (entry, index, fallback = {}) => {
  const lat = parseNumber(entry?.lat ?? entry?.latitude ?? entry?.position?.lat ?? fallback.lat);
  const lng = parseNumber(entry?.lng ?? entry?.longitude ?? entry?.position?.lng ?? fallback.lng);

  return {
    id: String(entry?.entryId ?? entry?.id ?? `entry-${index}`),
    spotId: entry?.spotId ?? fallback.spotId ?? null,
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

// ── entries 빌더 ────────────────────────────────────────

const buildEntriesFromPost = (postResponse) => {
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
        title: postResponse?.routeTitle ?? `루트 ${resolveRouteId(postResponse) ?? '-'}`,
        sceneNote: postResponse?.content ?? '',
        visitTimeLabel: formatTimeLabel(postResponse?.createdAt),
      },
    ),
  ];
};

// ── 상세 ViewModel ──────────────────────────────────────

export const toRoutePostDetail = (postResponse, comments = []) => {
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

// ── 카드 요약 ViewModel ─────────────────────────────────

export const toSummary = (detail) => ({
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

// ── 목록 정렬 ───────────────────────────────────────────

export const sortSummaries = (posts, sortBy = 'latest') => {
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
