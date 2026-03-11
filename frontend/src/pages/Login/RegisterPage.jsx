import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AuthFrame from '@/components/layout/AuthFrame';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <MainLayout isMapPage={false}>
      <AuthFrame>
        {/* 회원가입은 정보량이 많으므로 AuthFrame 내부에서 RegisterForm이 너비를 꽉 채움 */}
        <RegisterForm />
      </AuthFrame>
    </MainLayout>
  );
};

export default RegisterPage;
