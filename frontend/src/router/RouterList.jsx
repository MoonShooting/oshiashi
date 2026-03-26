import React from 'react';
import Home from '@/pages/Home';
import MapLayout from '@/components/layout/MapLayout';
import MapCore from '@/components/map/MapCore';
import MapPage from '@/pages/map/MapPage';
import SpotPage from '@/pages/spot/SpotPage';
import LoginPage from '@/pages/Login/LoginPage';
import FindAuthPage from '@/pages/Login/FindAuthPage';
import SignupPage from '@/pages/Login/RegisterPage';
import MyPage from '@/pages/MyPage';
import WithdrawPage from '@/pages/WithdrawPage';
import AchievementsPage from '@/pages/AchievementsPage';
import ArtworkSearchPage from '@/pages/post/ArtworkSearchPage';
import PostCreatePage from '@/pages/post/PostCreatePage';
import PostDetailPage from '@/pages/post/PostDetailPage';
import PostCommunityDetailPage from '@/pages/post/PostCommunityDetailPage';
import PostSearchPage from '@/pages/post/PostSearchPage';
import PostSearchResultPage from '@/pages/post/PostSearchResultPage';
import PostCommunityCreatePage from '@/pages/post/PostCommunityCreatePage';
import ProtectedRoute from '@/router/ProtectedRoute';

const withMapLayout = (Component) => <MapLayout>{Component}</MapLayout>;

const authList = [
  { path: '/login', element: <LoginPage /> },
  { path: '/find-auth', element: <FindAuthPage /> },
  { path: '/signup', element: <SignupPage /> },
];

const mapList = [
  {
    path: '/map',
    element: <MapPage />,
  },
  {
    path: '/spot',
    element: (
      <ProtectedRoute>
        <SpotPage />
      </ProtectedRoute>
    ),
  },
];

const postList = [
  { path: '/artworks', element: <ArtworkSearchPage /> },
  {
    path: '/posts/create',
    element: (
      <ProtectedRoute>
        <PostCreatePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/posts/:postId/edit',
    element: (
      <ProtectedRoute>
        <PostCreatePage />
      </ProtectedRoute>
    ),
  },
  { path: '/posts/:postId', element: <PostDetailPage /> },
  { path: '/post/:postId', element: <PostDetailPage /> },
  {
    path: '/community/create',
    element: (
      // 커뮤니티는 열람은 공개, 작성은 로그인 사용자만 허용.
      <ProtectedRoute>
        <PostCommunityCreatePage />
      </ProtectedRoute>
    ),
  },
  { path: '/community/:postId', element: <PostCommunityDetailPage /> },
  // 커뮤니티와 기존 게시물 검색 라우트를 명확히 분리합니다.
  { path: '/community', element: <PostSearchResultPage /> },
  { path: '/posts', element: <PostSearchPage /> },
];

const mypageList = [
  {
    path: '/mypage',
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mypage/withdraw',
    element: (
      <ProtectedRoute>
        <WithdrawPage />
      </ProtectedRoute>
    ),
  },
  { path: '/achievements', element: <AchievementsPage /> },
];

// 기본 메인 화면 제외하고 각 페이지에 맞추어서 그룹핑 하여 ...그룹핑한 변수명으로 작성하시면 됩니다.
export const RouterList = [
  {
    path: '/',
    element: <Home />,
  },
  ...authList,
  ...mapList,
  ...postList,
  ...mypageList,
];
