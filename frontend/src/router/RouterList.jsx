import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ProtectedRoute from '@/router/ProtectedRoute';

// ── 페이지별 지연 로딩 (코드 스플리팅) ──────────────────────
// Vite가 각 lazy import를 별도 청크로 분리하여
// 초기 번들에서 제외하고, 해당 라우트 접근 시에만 로드합니다.

// 메인
const Home = lazy(() => import('@/pages/Home'));

// 인증
const LoginPage = lazy(() => import('@/pages/Login/LoginPage'));
const FindAuthPage = lazy(() => import('@/pages/Login/FindAuthPage'));
const SignupPage = lazy(() => import('@/pages/Login/RegisterPage'));

// 지도 관련
const MapPage = lazy(() => import('@/pages/map/MapPage'));
const SpotPage = lazy(() => import('@/pages/spot/SpotPage'));

// 게시글 관련
const ArtworkSearchPage = lazy(() => import('@/pages/post/ArtworkSearchPage'));
const PostCreatePage = lazy(() => import('@/pages/post/PostCreatePage'));
const PostDetailPage = lazy(() => import('@/pages/post/PostDetailPage'));
const PostCommunityDetailPage = lazy(() => import('@/pages/post/PostCommunityDetailPage'));
const PostSearchPage = lazy(() => import('@/pages/post/PostSearchPage'));
const PostSearchResultPage = lazy(() => import('@/pages/post/PostSearchResultPage'));
const PostCommunityCreatePage = lazy(() => import('@/pages/post/PostCommunityCreatePage'));

// 마이페이지 관련
const MyPage = lazy(() => import('@/pages/MyPage'));
const WithdrawPage = lazy(() => import('@/pages/WithdrawPage'));
const AchievementsPage = lazy(() => import('@/pages/AchievementsPage'));

// ── Suspense 래퍼 ────────────────────────────────────────
// 각 지연 로딩 컴포넌트를 Suspense로 감싸 로딩 중 스피너를 표시합니다.
const withSuspense = (Component) => (
  <Suspense fallback={<LoadingSpinner />}>{Component}</Suspense>
);

// ── 라우트 정의 ──────────────────────────────────────────

const authList = [
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/find-auth', element: withSuspense(<FindAuthPage />) },
  { path: '/signup', element: withSuspense(<SignupPage />) },
];

const mapList = [
  {
    path: '/map',
    element: withSuspense(<MapPage />),
  },
  {
    path: '/spot',
    element: withSuspense(
      <ProtectedRoute>
        <SpotPage />
      </ProtectedRoute>
    ),
  },
];

const postList = [
  { path: '/artworks', element: withSuspense(<ArtworkSearchPage />) },
  {
    path: '/posts/create',
    element: withSuspense(
      <ProtectedRoute>
        <PostCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/posts/:postId/edit',
    element: withSuspense(
      <ProtectedRoute>
        <PostCreatePage />
      </ProtectedRoute>
    ),
  },
  { path: '/posts/:postId', element: withSuspense(<PostDetailPage />) },
  { path: '/post/:postId', element: withSuspense(<PostDetailPage />) },
  {
    path: '/community/create',
    element: withSuspense(
      // 커뮤니티는 열람은 공개, 작성은 로그인 사용자만 허용.
      <ProtectedRoute>
        <PostCommunityCreatePage />
      </ProtectedRoute>
    ),
  },
  { path: '/community/:postId', element: withSuspense(<PostCommunityDetailPage />) },
  // 커뮤니티와 기존 게시물 검색 라우트를 명확히 분리합니다.
  { path: '/community', element: withSuspense(<PostSearchResultPage />) },
  { path: '/posts', element: withSuspense(<PostSearchPage />) },
];

const mypageList = [
  {
    path: '/mypage',
    element: withSuspense(
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mypage/withdraw',
    element: withSuspense(
      <ProtectedRoute>
        <WithdrawPage />
      </ProtectedRoute>
    ),
  },
  { path: '/achievements', element: withSuspense(<AchievementsPage />) },
];

// 기본 메인 화면 제외하고 각 페이지에 맞추어서 그룹핑 하여 ...그룹핑한 변수명으로 작성하시면 됩니다.
export const RouterList = [
  {
    path: '/',
    element: withSuspense(<Home />),
  },
  ...authList,
  ...mapList,
  ...postList,
  ...mypageList,
];
