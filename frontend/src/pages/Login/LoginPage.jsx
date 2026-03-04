import MainLayout from '../../components/layout/MainLayout';
import AuthFrame from '../../components/layout/AuthFrame';
import LoginForm from '../../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <MainLayout isMapPage={false}>
      {/* AuthFrame이 "중앙 정렬 + 카드 테두리"를 담당 */}
      <AuthFrame>
        {/* LoginForm은 "아이디/비번 입력창"만 담당 */}
        <LoginForm />
      </AuthFrame>
    </MainLayout>
  );
};

export default LoginPage;
