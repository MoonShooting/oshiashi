import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import MainLayout from '../../components/layout/MainLayout';
import AuthFrame from '../../components/layout/AuthFrame';
import styles from '../../styles/RegisterCompletePage.module.css';

const RegisterCompletePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const accountSummary = [
    { label: '아이디', value: state?.userId || '-' },
    { label: '닉네임', value: state?.nickname || '-' },
    { label: '이메일', value: state?.email || '-' },
  ];

  return (
    <MainLayout isMapPage={false}>
      <AuthFrame>
        <section className={styles.completeCard}>
          <div className={styles.badge}>
            <CheckCircle2 size={46} />
          </div>

          <p className={styles.stepChip}>3. 완료</p>
          <h2>회원가입이 완료되었습니다</h2>
          <p className={styles.description}>
            推し足에 오신 것을 환영합니다. 이제 로그인하고 성지순례 루트를 만들어보세요.
          </p>

          <ul className={styles.summaryList}>
            {accountSummary.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/')}>
              홈으로
            </button>
            <Link to="/login" className={styles.primaryBtn}>
              로그인 하러가기
            </Link>
          </div>
        </section>
      </AuthFrame>
    </MainLayout>
  );
};

export default RegisterCompletePage;
