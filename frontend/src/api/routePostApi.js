/*
[routePostApi - Re-export Hub]
기존 965줄의 모놀리식 파일을 6개 단일 책임 모듈로 분리했습니다.
이 파일은 하위 호환성을 위해 모든 public export를 re-export합니다.

모듈 구조:
  routePost/
  ├── tokenUtils.js     — JWT 토큰 파싱 (resolveUserIdForRouteQuery)
  ├── normalize.js      — 응답 정규화 ViewModel 빌더
  ├── routeOptions.js   — 루트 선택/복원/payload 빌더
  ├── postCrud.js       — 게시글 CRUD + 좋아요 + 이벤트
  ├── commentApi.js     — 댓글 CRUD
  ├── bookmarkApi.js    — 북마크 CRUD
  └── index.js          — 통합 re-export

기존 import 방식이 모두 동작합니다:
  import { fetchRoutePosts } from '@/api/routePostApi';          // ✅ 기존
  import { fetchRoutePosts } from '@/api/routePost';             // ✅ 새 경로
  import { fetchRoutePosts } from '@/api/routePost/postCrud';    // ✅ 직접 참조
*/

export {
  // 게시글 CRUD
  createRoutePost,
  deleteRoutePost,
  fetchRoutePostById,
  fetchRoutePosts,
  likeRoutePost,
  updateRoutePost,

  // 댓글 CRUD
  createRouteComment,
  deleteRouteComment,
  updateRouteComment,

  // 북마크 CRUD
  createPostBookmark,
  deletePostBookmark,
  fetchMyPostBookmarks,

  // 루트 선택/복원
  loadPostCreateRoutes,

  // 이벤트
  routePostsUpdatedEvent,
} from './routePost/index';
