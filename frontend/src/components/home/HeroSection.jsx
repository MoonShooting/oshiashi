import React from 'react';
import styles from '../../styles/Home.module.css';

const HeroSection = () => {
  return (
    <section className={styles.heroBanner}>
      <div className={styles.bannerOverlay}>
        <h1>당신의 덕질을 현실로</h1>
        <p>일본 애니메이션 성지순례의 모든 것</p>
        <button className={styles.routeBtn}>살펴보기 →</button>
      </div>
    </section>
  );
};

export default HeroSection;
