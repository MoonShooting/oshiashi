import React from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostComparisonViewer = ({
  entries,
  activeIndex,
  onPrev,
  onNext,
  onSelectIndex,
  onOpenLocation,
}) => {
  const activeEntry = entries[activeIndex];

  if (!activeEntry) return null;

  // 서버 데이터가 일부 비어도 화면이 깨지지 않도록
  // reference/user 이미지를 서로 fallback 처리합니다.
  const referenceImageUrl = activeEntry.referenceImageUrl || activeEntry.userImageUrl || '';
  const userImageUrl = activeEntry.userImageUrl || activeEntry.referenceImageUrl || '';

  return (
    <section className={styles.viewerCard}>
      <div className={styles.viewerMediaGrid}>
        <button
          type="button"
          className={styles.viewerPane}
          onClick={() => onOpenLocation(activeEntry)}>
          <img
            src={referenceImageUrl}
            alt={activeEntry.artworkTitle}
            className={styles.viewerImage}
          />
          <span className={`${styles.viewerBadge} ${styles.viewerBadgeReference}`}>
            원본 장면
          </span>
        </button>

        <div className={styles.viewerDivider} />

        <button
          type="button"
          className={styles.viewerPane}
          onClick={() => onOpenLocation(activeEntry)}>
          <img
            src={userImageUrl}
            alt={activeEntry.title}
            className={styles.viewerImage}
          />
          <span className={`${styles.viewerBadge} ${styles.viewerBadgeUser}`}>
            내 사진
          </span>
        </button>
      </div>

      <div className={styles.viewerOverlay}>
        <div>
          <p className={styles.viewerSceneTitle}>{activeEntry.artworkTitle}</p>
          <div className={styles.viewerLocationRow}>
            <MapPin size={16} />
            <span>{activeEntry.address}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.viewerLocationButton}
          onClick={() => onOpenLocation(activeEntry)}>
          지도에서 보기
        </button>
      </div>

      <button
        type="button"
        className={`${styles.viewerArrow} ${styles.viewerArrowLeft}`}
        onClick={onPrev}>
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        className={`${styles.viewerArrow} ${styles.viewerArrowRight}`}
        onClick={onNext}>
        <ChevronRight size={22} />
      </button>

      <div className={styles.viewerIndicators}>
        {entries.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            className={
              index === activeIndex
                ? `${styles.viewerIndicator} ${styles.viewerIndicatorActive}`
                : styles.viewerIndicator
            }
            onClick={() => onSelectIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default PostComparisonViewer;
