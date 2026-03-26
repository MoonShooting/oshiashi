import React from 'react';
import { MessageCircleMore } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostInfoSidebar = ({ post }) => {
  return (
    <aside className={styles.sidebarStack}>
      {/*
        구현 예정 기능 보존용 주석
        - 추천 OST 카드
        - AI 루트 요약 카드
        실제 렌더는 잠시 숨기되, 기존 상세 페이지 카드 구조는 참고용으로 남겨 둡니다.

        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <Headphones size={18} />
            <h3>추천 OST</h3>
          </div>
          <div className={styles.soundtrackList}>
            <div className={styles.soundtrackItem}>
              <strong>추천 OST 정보가 아직 없습니다.</strong>
              <p>장면 기반 OST 추천 기능 구현 후 다시 노출합니다.</p>
            </div>
          </div>
        </section>

        <section className={styles.infoCard}>
          <div className={styles.infoCardHeader}>
            <Sparkles size={18} />
            <h3>루트 요약</h3>
          </div>
          <div className={styles.routeSummary}>
            <span className={styles.routeSummaryLabel}>루트 이름</span>
            <strong>{post?.routeName ?? '루트 이름 없음'}</strong>
            <span className={styles.routeSummaryLabel}>주요 구간</span>
            <p>{activeEntry?.title ?? '위치 정보 없음'}</p>
          </div>
        </section>
      */}

      <section className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <MessageCircleMore size={18} />
          <h3>장면 가이드</h3>
        </div>
        <p className={styles.infoCardText}>{post.guideText}</p>
      </section>
    </aside>
  );
};

export default PostInfoSidebar;
