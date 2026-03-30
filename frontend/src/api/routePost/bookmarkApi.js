/*
[bookmarkApi - 게시물 북마크 CRUD]
- fetchMyPostBookmarks: 내 게시물 북마크 목록 조회
- createPostBookmark: 북마크 생성
- deletePostBookmark: 북마크 삭제
*/

import { FetchJson } from '@/api/FetchClient';
import {
  appendUserIdQuery,
  fetchBookmarksWithFallback,
  normalizeBookmark,
} from '@/api/postApiShared';
import { emitRoutePostsUpdated } from './postCrud';

// ── 북마크 목록 조회 ───────────────────────────────────────

export const fetchMyPostBookmarks = async ({ userId } = {}) => {
  const bookmarks = await fetchBookmarksWithFallback({ fetchJson: FetchJson, userId });

  return bookmarks
    .filter((bookmark) => bookmark?.postId != null)
    .map(normalizeBookmark)
    .filter((bookmark) => bookmark.bookmarkId && bookmark.postId);
};

// ── 북마크 생성 ────────────────────────────────────────────

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

// ── 북마크 삭제 ────────────────────────────────────────────

export const deletePostBookmark = async ({ bookmarkId, userId }) => {
  const endpoint = appendUserIdQuery(`/api/v1/bookmarks/${bookmarkId}`, userId);

  await FetchJson(endpoint, {
    method: 'DELETE',
  });

  emitRoutePostsUpdated();
};
