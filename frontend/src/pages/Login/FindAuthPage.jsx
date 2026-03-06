import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AuthFrame from '../../components/layout/AuthFrame';
import FindAuth from '../../components/auth/FindAuth';

const FindAuthPage = () => {
  return (
    <MainLayout isMapPage={false}>
      <AuthFrame>
        {/* 중앙 정렬 + 카드 테두리 담당 */}
        <FindAuth />
      </AuthFrame>
    </MainLayout>
  );
};

export default FindAuthPage;
