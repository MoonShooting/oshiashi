import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Home.module.css';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.heroBanner}>
      <div className={styles.bannerOverlay}>
        <h1>당신의 덕질을 현실로</h1>
        <p>일본 애니메이션 성지순례의 모든 것</p>
        {/* 메인 히어로 CTA는 서비스 전체 모습을 바로 보여주는 맵 화면으로 연결합니다. */}
        <button type="button" className={styles.routeBtn} onClick={() => navigate('/map')}>
          맵으로 살펴보기 →
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
