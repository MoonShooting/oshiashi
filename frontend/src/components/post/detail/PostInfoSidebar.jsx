import React from 'react';
import { Headphones, MapPinned, MessageCircleMore, Sparkles } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostInfoSidebar = ({ post, activeEntry, onOpenLocation }) => {
  // 추천 OST는 배열이 아닐 수 있으므로 안전하게 정규화합니다.
  const tracks = Array.isArray(post?.audioRecommendations) ? post.audioRecommendations : [];

  return (
    <aside className={styles.sidebarStack}>
      <section className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <MessageCircleMore size={18} />
          <h3>장면 가이드</h3>
        </div>
        <p className={styles.infoCardText}>{post.guideText}</p>
      </section>

      <section className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <MapPinned size={18} />
          <h3>빠른 위치</h3>
        </div>
        <div className={styles.locationPreview}>
          <div className={styles.locationMapMock}>
            <div className={styles.locationPinDot} />
            <span className={styles.locationLabel}>{activeEntry.title}</span>
          </div>
          <div className={styles.locationMeta}>
            <strong>{activeEntry.title}</strong>
            <p>{activeEntry.address}</p>
            <button
              type="button"
              className={styles.sidebarPrimaryButton}
              onClick={() => onOpenLocation(activeEntry)}>
              지도 보기
            </button>
          </div>
        </div>
      </section>

      <section className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <Headphones size={18} />
          <h3>추천 OST</h3>
        </div>
        <div className={styles.soundtrackList}>
          {tracks.length > 0 ? (
            tracks.map((track) => (
              <div key={track.id} className={styles.soundtrackItem}>
                <strong>{track.title}</strong>
                <p>{track.note}</p>
              </div>
            ))
          ) : (
            <p className={styles.infoCardText}>추천 OST 정보가 아직 없습니다.</p>
          )}
        </div>
      </section>

      <section className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <Sparkles size={18} />
          <h3>루트 요약</h3>
        </div>
        <div className={styles.routeSummary}>
          <span className={styles.routeSummaryLabel}>루트 이름</span>
          <strong>{post.routeTitle}</strong>
          <span className={styles.routeSummaryLabel}>주요 구간</span>
          <p>{post.locationSummary}</p>
        </div>
      </section>
    </aside>
  );
};

export default PostInfoSidebar;
