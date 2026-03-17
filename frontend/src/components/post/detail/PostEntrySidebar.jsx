import React from 'react';
import styles from '@/styles/PostDetailPage.module.css';

const PostEntrySidebar = ({ entries, activeEntryId, onSelectEntry }) => {
  return (
    <aside className={styles.sidebarCard}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>루트 장면 기록</h2>
        <p className={styles.sidebarHint}>선택한 spot에 따라 본문과 비교 이미지가 바뀝니다.</p>
      </div>

      <div className={styles.entryNavList}>
        {entries.map((entry, index) => {
          const isActive = entry.id === activeEntryId;
          // 썸네일도 reference/user 중 존재하는 값을 우선 사용합니다.
          const thumbnailUrl = entry.userImageUrl || entry.referenceImageUrl || '';

          return (
            <button
              key={entry.id}
              type="button"
              className={isActive ? `${styles.entryNavItem} ${styles.entryNavItemActive}` : styles.entryNavItem}
              onClick={() => onSelectEntry(entry.id)}>
              <div className={styles.entryNavThumbWrap}>
                <img
                  src={thumbnailUrl}
                  alt={entry.title}
                  className={styles.entryNavThumb}
                />
                <span className={styles.entryNavIndex}>{index + 1}</span>
              </div>
              <div className={styles.entryNavBody}>
                <strong className={styles.entryNavTitle}>{entry.title}</strong>
                <p className={styles.entryNavMeta}>{entry.artworkTitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default PostEntrySidebar;
