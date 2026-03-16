import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import AuthFrame from '../../components/layout/AuthFrame';
import FindAuth from '../../components/auth/FindAuth';

const FindAuthPage = () => {
  return (
    <MainLayout
      isMapPage={false}
      // 계정 찾기 화면도 로그인 플로우의 일부이므로 login 메뉴를 활성 상태로 유지합니다.
      // 이 값을 명시하지 않으면 이전 기본값 영향으로 홈 메뉴가 켜져 보일 수 있어, 사용자 입장에서 현재 위치가 헷갈릴 수 있습니다.
      activeMenuKey="login">
      <AuthFrame>
        {/* 중앙 정렬 + 카드 테두리 담당 */}
        <FindAuth />
      </AuthFrame>
    </MainLayout>
  );
};

export default FindAuthPage;
