import { FetchJson } from '@/api/FetchClient';
import {
  appendUserIdQuery,
  buildAvatarLabel,
  extractArrayPayload,
  fetchBookmarksWithFallback,
  formatDateLabel,
  formatRelativeTimeLabel,
  formatTimeLabel,
  normalizeTagNames,
  normalizeBookmark,
} from '@/api/postApiShared';

/*
[communityApi - 핵심 CRUD 경량화 버전]
- 목적: 커뮤니티 목록/상세/게시글 CRUD/댓글 CRUD를 "필수 기능" 위주로 유지
- 원칙: 화면에서 바로 쓸 수 있는 ViewModel로 정규화하되, 과도한 분기/호환 코드는 줄임
- 동기화: 생성/수정/삭제 후 community-posts-changed 이벤트를 발행해 목록/홈 미리보기 재조회
*/
const COMMUNITY_POSTS_UPDATED_EVENT = 'community-posts-changed';

const emitCommunityPostsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMMUNITY_POSTS_UPDATED_EVENT));
  }
};

const SORT_QUERY_MAP = {
  latest: 'latest',
  popular: 'like',
  views: 'view',
};

const getStoredAccessToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

const resolveUserId = (explicitUserId) => {
  if (typeof explicitUserId === 'string' && explicitUserId.trim()) {
    return explicitUserId.trim();
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

// postApiShared 유틸을 재사용해 route/community 간 응답 처리 규칙을 통일합니다.

const resolvePostId = (post) => String(post?.postId ?? post?.id ?? '');

// 커뮤니티 글 판별 규칙: routeId가 null이어야 합니다.
const resolveRouteId = (post) => {
  if (!post) return null;
  if (post.routeId != null) return post.routeId;
  if (post.route?.routeId != null) return post.route.routeId;
  if (post.route?.id != null) return post.route.id;
  return null;
};

const normalizeComment = (comment) => {
  const author = comment.nickname ?? comment.userName ?? comment.userId ?? '익명';

  return {
    id: String(comment.commentId ?? comment.id ?? ''),
    author,
    authorId: comment.userId ?? null,
    avatarLabel: buildAvatarLabel(author),
    timeLabel: formatRelativeTimeLabel(comment.createdAt),
    createdAt: comment.createdAt,
    content: comment.content ?? '',
  };
};

// 게시글 + 댓글 응답을 커뮤니티 상세 화면용 모델로 합칩니다.
const toCommunityDetail = (post, comments = []) => {
  if (!post) return null;

  const createdAt = post.createdAt ?? new Date().toISOString();
  const authorId = post.userId ?? 'anonymous';
  const authorName = post.userNickname ?? post.userName ?? authorId;
  const normalizedComments = comments.map(normalizeComment);

  return {
    id: resolvePostId(post),
    routeId: resolveRouteId(post),
    boardType: 'FREE',
    title: post.title ?? '',
    summary: (post.content ?? '').slice(0, 120),
    content: post.content ?? '',
    author: {
      userId: authorId,
      name: authorName,
      avatarLabel: buildAvatarLabel(authorName),
    },
    createdAt,
    publishedDateLabel: formatDateLabel(createdAt),
    publishedTimeLabel: formatTimeLabel(createdAt),
    tagNames: normalizeTagNames(post.tagNames),
    stats: {
      views: Number(post.viewCount ?? 0),
      likes: Number(post.likeCount ?? 0),
    },
    commentCount: Number(post.commentCount ?? normalizedComments.length),
    comments: normalizedComments,
  };
};

// 상세 모델을 카드 목록용 요약 모델로 축소합니다.
const toSummary = (detail) => ({
  id: detail.id,
  routeId: null,
  title: detail.title,
  content: detail.summary ?? detail.content,
  userId: detail.author?.name ?? detail.author?.userId ?? '익명',
  viewCount: detail.stats?.views ?? 0,
  likeCount: detail.stats?.likes ?? 0,
  commentCount: detail.commentCount ?? detail.comments?.length ?? 0,
  tagNames: detail.tagNames ?? [],
  imageUrl: '',
  publishedAt: detail.publishedDateLabel ?? '',
  boardType: 'FREE',
  category: '커뮤니티',
  createdAt: detail.createdAt,
});

/*
[커뮤니티 목록 조회]
- 백엔드 명세에 맞춰 커뮤니티 전용 엔드포인트(/api/v1/posts/notroute)를 호출합니다.
- 검색어/정렬 조건을 그대로 querystring으로 전달합니다.
*/
export const fetchCommunityPosts = async ({ search = '', sortBy = 'latest', limit } = {}) => {
  const params = new URLSearchParams();
  params.set('sort', SORT_QUERY_MAP[sortBy] ?? 'latest');

  const keyword = search.trim();
  if (keyword) params.set('search', keyword);

  const response = await FetchJson(`/api/v1/posts/notroute?${params.toString()}`);
  const posts = extractArrayPayload(response)
    .map((post) => toCommunityDetail(post, []))
    .filter((post) => post && post.routeId == null && post.id)
    .map(toSummary);

  return typeof limit === 'number' ? posts.slice(0, Math.max(0, limit)) : posts;
};

/*
[커뮤니티 상세 조회]
- 게시글 상세 + 댓글 목록을 합쳐 상세 화면 모델로 반환합니다.
- routeId가 존재하면 커뮤니티가 아니므로 null 처리합니다.
*/
export const fetchCommunityPostById = async (postId) => {
  const post = await FetchJson(`/api/v1/posts/${postId}`);
  if (resolveRouteId(post) != null) return null;

  const rawComments = await FetchJson(`/api/v1/posts/${postId}/comments`);
  return toCommunityDetail(post, extractArrayPayload(rawComments));
};

// ------------------------------
// 커뮤니티 게시글 CRUD
// ------------------------------
// 커뮤니티 글 생성: routeId를 null로 고정해 일반 루트 게시글과 구분합니다.
export const createCommunityPost = async ({ title, content }) => {
  const created = await FetchJson('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content, routeId: null }),
  });

  emitCommunityPostsUpdated();
  return toCommunityDetail(created, []);
};

// 게시글 수정 후 상세를 재조회해 화면 상태를 서버 기준으로 맞춥니다.
export const updateCommunityPost = async ({ postId, title, content, userId }) => {
  const endpoint = appendUserIdQuery(`/api/v1/posts/${postId}`, resolveUserId(userId));

  await FetchJson(endpoint, {
    method: 'PATCH',
    body: JSON.stringify({ title, content }),
  });

  const updated = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return updated;
};

// 삭제는 성공 여부만 확인하고, 목록 갱신 이벤트를 발행합니다.
export const deleteCommunityPost = async ({ postId, userId }) => {
  const endpoint = appendUserIdQuery(`/api/v1/posts/${postId}`, resolveUserId(userId));
  await FetchJson(endpoint, { method: 'DELETE' });
  emitCommunityPostsUpdated();
};

// ------------------------------
// 커뮤니티 댓글 CRUD
// ------------------------------
// 댓글 작성 후 상세 재조회(댓글 수/상대시간 포함 최신 상태 동기화)
export const createCommunityComment = async ({ postId, content }) => {
  await FetchJson(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

// 댓글 수정 후 상세 재조회
export const updateCommunityComment = async ({ postId, commentId, content }) => {
  await FetchJson(`/api/v1/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

// 댓글 삭제 후 상세 재조회
export const deleteCommunityComment = async ({ postId, commentId }) => {
  await FetchJson(`/api/v1/comments/${commentId}`, { method: 'DELETE' });

  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

/*
[좋아요/북마크]
- 커뮤니티 상세도 일반 게시글 상세와 동일하게 좋아요/북마크 토글을 지원합니다.
- 처리 후 상세를 재조회해 화면 상태를 서버 기준으로 맞춥니다.
*/
export const likeCommunityPost = async ({ postId }) => {
  await FetchJson(`/api/v1/posts/${postId}/like`, { method: 'POST' });
  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

export const fetchMyCommunityBookmarks = async ({ userId } = {}) => {
  const bookmarks = await fetchBookmarksWithFallback({ fetchJson: FetchJson, userId });

  return bookmarks
    .filter((bookmark) => bookmark?.postId != null)
    .map(normalizeBookmark)
    .filter((bookmark) => bookmark.bookmarkId && bookmark.postId);
};

export const createCommunityBookmark = async ({ postId, userId, bookmarkName }) => {
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
    const bookmarks = await fetchMyCommunityBookmarks({ userId });
    return bookmarks.find((bookmark) => String(bookmark.postId) === String(postId)) ?? null;
  }

  emitCommunityPostsUpdated();
  return normalizeBookmark(response);
};

export const deleteCommunityBookmark = async ({ bookmarkId, userId }) => {
  const endpoint = appendUserIdQuery(`/api/v1/bookmarks/${bookmarkId}`, userId);

  await FetchJson(endpoint, {
    method: 'DELETE',
  });

  emitCommunityPostsUpdated();
};

// 외부(useEffect)에서 동일 이벤트명을 재사용할 수 있도록 export
export const communityPostsUpdatedEvent = COMMUNITY_POSTS_UPDATED_EVENT;
