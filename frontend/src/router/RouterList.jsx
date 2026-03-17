import React from 'react';
import Home from '@/pages/Home';
import MapPage from '@/pages/map/MapPage';
import SpotPage from '@/pages/spot/SpotPage';
import LoginPage from '@/pages/Login/LoginPage';
import FindAuthPage from '@/pages/Login/FindAuthPage';
import SignupPage from '@/pages/Login/RegisterPage';
import MyPage from '@/pages/MyPage';
import AchievementsPage from '@/pages/AchievementsPage';
import ArtworkSearchPage from '@/pages/post/ArtworkSearchPage';
import PostCreatePage from '@/pages/post/PostCreatePage';
import PostDetailPage from '@/pages/post/PostDetailPage';
import PostSearchResultPage from '@/pages/post/PostSearchResultPage';

const authList = [
  { path: '/login', element: <LoginPage /> },
  { path: '/find-auth', element: <FindAuthPage /> },
  { path: '/signup', element: <SignupPage /> },
];

const mapList = [
  { path: '/map', element: <MapPage /> },
  { path: '/spot', element: <SpotPage /> },
];

const postList = [
  { path: '/artworks', element: <ArtworkSearchPage /> },
  { path: '/posts/create', element: <PostCreatePage /> },
  { path: '/posts/:postId', element: <PostDetailPage /> },
  { path: '/post/:postId', element: <PostDetailPage /> },
  { path: '/posts', element: <PostSearchResultPage /> },
];

const mypageList = [
  { path: '/mypage', element: <MyPage /> },
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
