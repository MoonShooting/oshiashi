import React from 'react';
import { Trophy } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import styles from '@/styles/AchievementsPage.module.css';

const AchievementsPage = () => {
  return (
    <MainLayout isMapPage={false} activeMenuKey="achievements">
      <div className={styles.page}>
        <section className={styles.heroCard}>
          <div className={styles.heroIconWrap}>
            <Trophy className={styles.heroIcon} strokeWidth={2} />
          </div>

          <div className={styles.heroText}>
            <h2>업적 페이지</h2>
            <p>마이페이지에서는 업적 미리보기만 보여주고, 전체 업적은 이 페이지에서 확인하는 흐름으로 분리했습니다.</p>
          </div>
        </section>

        <section className={styles.emptyCard}>
          <strong>표시할 업적 데이터가 아직 없습니다.</strong>
          <p>업적 API가 연결되면 이 영역에 사용자 업적 목록과 달성 상태를 실제 데이터로 렌더링합니다.</p>
        </section>
      </div>
    </MainLayout>
  );
};

export default AchievementsPage;
