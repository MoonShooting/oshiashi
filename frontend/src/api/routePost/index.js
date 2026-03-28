/*
[routePost/index.js - 모듈 통합 re-export]
기존 routePostApi.js에서 분리된 6개 하위 모듈의 public API를 한 곳에서 re-export합니다.
기존 import 경로(@/api/routePostApi)와의 호환성을 위해 routePostApi.js도 이 index를 가리킵니다.
*/

// 토큰 유틸리티
export { resolveUserIdForRouteQuery } from './tokenUtils';

// 응답 정규화 유틸리티
export {
  normalizeComment,
  normalizeEntry,
  normalizeTagList,
  normalizeTagNames,
  parseNumber,
  resolvePersistableReferenceImageUrl,
  resolvePersistableUserImageUrl,
  resolvePostId,
  resolveRouteId,
  sortSummaries,
  toRoutePostDetail,
  toSummary,
  unwrapObjectPayload,
} from './normalize';

// 루트 선택/복원 로직
export {
  buildDevMockRoutes,
  buildRouteCreatePayload,
  dedupeRoutes,
  loadPostCreateRoutes,
  normalizeBookmarkedRouteFromPins,
  normalizeBookmarkedRouteFromPostDetail,
  normalizeRouteOption,
} from './routeOptions';

// 게시글 CRUD + 좋아요
export {
  createRoutePost,
  deleteRoutePost,
  emitRoutePostsUpdated,
  fetchRoutePostById,
  fetchRoutePosts,
  likeRoutePost,
  ROUTE_POSTS_UPDATED_EVENT,
  updateRoutePost,
} from './postCrud';

// 댓글 CRUD
export {
  createRouteComment,
  deleteRouteComment,
  updateRouteComment,
} from './commentApi';

// 북마크 CRUD
export {
  createPostBookmark,
  deletePostBookmark,
  fetchMyPostBookmarks,
} from './bookmarkApi';

// 하위 호환: 기존 코드에서 `routePostsUpdatedEvent`로 참조하는 경우 대응
export { ROUTE_POSTS_UPDATED_EVENT as routePostsUpdatedEvent } from './postCrud';
