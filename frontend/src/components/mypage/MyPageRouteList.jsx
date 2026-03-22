import React from 'react';
import styles from '@/styles/MyPage.module.css';

const MyPageRouteList = ({ items, isBookmark = false }) => (
  <div className={styles.routeGrid}>
    {items.map((item) => (
      <article key={item.id} className={styles.routeCard}>
        <div className={styles.routeCardTop}>
          <span className={styles.routeBadge}>{isBookmark ? '북마크한 루트' : item.visibilityLabel}</span>
          <span className={styles.routeDate}>{item.publishedAt}</span>
        </div>

        <div className={styles.routeTitleBlock}>
          <h4 className={styles.routeTitle}>{item.title}</h4>
          {item.bookmarkName ? <p className={styles.routeBookmarkName}>{item.bookmarkName}</p> : null}
        </div>

        <div className={styles.routeMetaRow}>
          <span>{item.spotCount}개 스팟</span>
          {item.ownerId ? <span>작성자 {item.ownerId}</span> : null}
        </div>

        {item.spotNames.length > 0 ? (
          <div className={styles.routeSpotList}>
            {item.spotNames.slice(0, 6).map((spotName) => (
              <span key={`${item.id}-${spotName}`} className={styles.routeSpotChip}>
                {spotName}
              </span>
            ))}
          </div>
        ) : (
          <p className={styles.routeEmptyText}>등록된 장소가 아직 없습니다.</p>
        )}
      </article>
    ))}
  </div>
);

export default MyPageRouteList;
