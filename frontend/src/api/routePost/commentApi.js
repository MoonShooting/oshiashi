/*
[commentApi - 댓글 CRUD]
- createRouteComment: 댓글 생성
- updateRouteComment: 댓글 수정
- deleteRouteComment: 댓글 삭제
- 변경 후 상세를 재조회해 댓글 수/상대시간 등을 서버 상태로 동기화합니다.
*/

import { FetchJson } from '@/api/FetchClient';
import { emitRoutePostsUpdated, fetchRoutePostById } from './postCrud';

// ── 댓글 생성 ──────────────────────────────────────────────

export const createRouteComment = async ({ postId, content }) => {
  await FetchJson(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

// ── 댓글 수정 ──────────────────────────────────────────────

export const updateRouteComment = async ({ postId, commentId, content }) => {
  await FetchJson(`/api/v1/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};

// ── 댓글 삭제 ──────────────────────────────────────────────

export const deleteRouteComment = async ({ postId, commentId }) => {
  await FetchJson(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
  });

  const refreshed = await fetchRoutePostById(postId);
  emitRoutePostsUpdated();
  return refreshed;
};
