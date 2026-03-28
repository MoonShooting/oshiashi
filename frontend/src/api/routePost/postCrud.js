/*
[postCrud - 게시글 CRUD + 좋아요]
- fetchRoutePosts: 목록 조회 (검색/태그/정렬)
- fetchRoutePostById: 상세 + 댓글 조회
- createRoutePost: 게시글 생성 (JSON)
- updateRoutePost: 게시글 수정
- deleteRoutePost: 게시글 삭제
- likeRoutePost: 좋아요 토글
- emitRoutePostsUpdated: 데이터 변경 이벤트 발행
- ROUTE_POSTS_UPDATED_EVENT: 이벤트 이름 상수
*/

import { FetchJson } from '@/api/FetchClient';
import { extractArrayPayload } from '@/api/postApiShared';

import {
  resolvePostId,
  resolveRouteId,
  sortSummaries,
  toRoutePostDetail,
  toSummary,
  unwrapObjectPayload,
} from './normalize';
import { buildRouteCreatePayload } from './routeOptions';

// ── 이벤트 ─────────────────────────────────────────────────

export const ROUTE_POSTS_UPDATED_EVENT = 'route-posts-changed';

export const emitRoutePostsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ROUTE_POSTS_UPDATED_EVENT));
  }
};

// ── 목록 조회 ──────────────────────────────────────────────

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

// ── 상세 조회 ──────────────────────────────────────────────

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

// ── 생성 ───────────────────────────────────────────────────

export const createRoutePost = async ({ selectedRoute, title, selectedTags = [], entries }) => {
  const post = buildRouteCreatePayload({ selectedRoute, title, selectedTags, entries });

  const response = await FetchJson('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify(post),
  });
  const payload = unwrapObjectPayload(response);

  emitRoutePostsUpdated();

  const createdPostId = resolvePostId(payload);
  if (createdPostId) {
    return toRoutePostDetail(payload, []);
  }

  return toRoutePostDetail(payload, []);
};

// ── 수정 ───────────────────────────────────────────────────

export const updateRoutePost = async ({ postId, title, content, userId, selectedRoute, selectedTags = [], entries = [] }) => {
  const body =
    entries.length > 0 || selectedRoute
      ? buildRouteCreatePayload({
          selectedRoute: selectedRoute ?? { routeId: null },
          title: title ?? '',
          selectedTags,
          entries,
        })
      : { title, content, userId };

  if (userId && typeof body === 'object') {
    body.userId = userId;
  }

  await FetchJson(`/api/v1/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

// ── 삭제 ───────────────────────────────────────────────────

export const deleteRoutePost = async ({ postId, userId }) => {
  await FetchJson(`/api/v1/posts/${postId}?userId=${userId}`, {
    method: 'DELETE',
  });

  emitRoutePostsUpdated();
};

// ── 좋아요 ─────────────────────────────────────────────────

export const likeRoutePost = async ({ postId }) => {
  await FetchJson(`/api/v1/posts/${postId}/like`, {
    method: 'POST',
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};
