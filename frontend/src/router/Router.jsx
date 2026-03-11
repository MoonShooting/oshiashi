import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import MapPage from '@/pages/map/MapPage';
import PinPage from '@/pages/pin/PinPage';
import LoginPage from '@/pages/Login/LoginPage';
import FindAuthPage from '@/pages/Login/FindAuthPage';
import RegisterPage from '@/pages/Login/RegisterPage';
import PostSearchResultPage from '@/pages/PostSearchResultPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 각 페이지 컴포넌트 내부에서 MainLayout을 사용하므로 여기선 경로만 설정합니다 */}
        {/* 각 페이지별로 분리 필요 */}
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/pin" element={<PinPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/find-auth" element={<FindAuthPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/posts" element={<PostSearchResultPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
