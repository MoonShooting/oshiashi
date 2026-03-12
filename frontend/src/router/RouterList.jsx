import React from 'react';
import Home from '@/pages/Home';
import MapPage from '@/pages/map/MapPage';
import PinPage from '@/pages/pin/PinPage';
import LoginPage from '@/pages/Login/LoginPage';
import FindAuthPage from '@/pages/Login/FindAuthPage';
import SignupPage from '@/pages/Login/RegisterPage';
import MyPage from '@/pages/MyPage';

const authList = [
  { path: '/login', element: <LoginPage /> },
  { path: '/find-auth', element: <FindAuthPage /> },
  { path: '/signup', element: <SignupPage /> },
];

const mapList = [
  { path: '/map', element: <MapPage /> },
  { path: '/pin', element: <PinPage /> },
];

//기본 메인 화면 제외하고 각 페이지에 맞추어서 그룹핑 하여 ...그룹핑한 변수명으로 작성하시면 됩니다.
export const RouterList = [
  {
    path: '/',
    element: <Home />,
  },
  ...authList,
  ...mapList,
  {
    path: '/mypage',
    element: <MyPage />,
  },
];
