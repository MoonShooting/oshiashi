import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import styles from '../styles/Home.module.css';

const Home = () => {
  return (
    <MainLayout isMapPage={false}>
      <div className={styles.homeContent}>
        {/* 상단 배너 섹션 */}
        <section className={styles.heroBanner}>
          <div className={styles.bannerOverlay}>
            <h1>당신의 덕질을 현실로</h1>
            <p>일본 애니메이션 성지순례의 모든 것</p>
            <button className={styles.routeBtn}>루트 만들기 →</button>
          </div>
        </section>

        {/* 인기 작품 섹션 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>인기 작품</h2>
            <span className={styles.viewAll}>전체 보기 〉</span>
          </div>
          <div className={styles.grid}>
            {/* 여기에 WorkCard 컴포넌트들이 들어갈 예정 */}
            <div className={styles.dummyCard}>작품 카드</div>
            <div className={styles.dummyCard}>작품 카드</div>
            <div className={styles.dummyCard}>작품 카드</div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Home;
