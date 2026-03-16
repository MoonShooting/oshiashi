import React, { useMemo, useState } from 'react';
import { Bookmark, MapPin, MapPinned } from 'lucide-react';
import styles from '../../styles/Home.module.css';

const routes = [
  { id: 1, title: '도쿄 신카이 마코토 성지순례 1박2일 코스', tags: ['도쿄', '도보'], spots: 8, bookmarks: 245, rank: 3 },
  { id: 2, title: '카마쿠라 슬램덩크 덕질 루트', tags: ['카마쿠라', '반나절'], spots: 5, bookmarks: 189, rank: 2 },
  { id: 3, title: '교토 감성 여행 코스', tags: ['교토', '사진'], spots: 12, bookmarks: 312, rank: 4 },
  { id: 4, title: '아키하바라 하루 완성 루트', tags: ['아키하바라', '굿즈'], spots: 15, bookmarks: 398, rank: 1 },
  { id: 5, title: '오사카 애니 데이트 코스', tags: ['오사카', '데이트'], spots: 10, bookmarks: 221, rank: 5 },
  { id: 6, title: '우지 음악 여행 루트', tags: ['우지', '음악'], spots: 9, bookmarks: 176, rank: 6 },
];

const RecommendedRoutesSection = () => {
  const [filter, setFilter] = useState('전체');

  const items = useMemo(() => {
    if (filter === '인기순') return [...routes].sort((a, b) => b.bookmarks - a.bookmarks);
    if (filter === '최신순') return [...routes].sort((a, b) => a.rank - b.rank);
    return routes;
  }, [filter]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>추천 루트</h2>
          <p>다른 덕후들의 성지순례 루트</p>
        </div>
        <div className={styles.filterRow}>
          {['전체', '인기순', '최신순'].map((item) => (
            <button key={item} className={filter === item ? styles.filterBtnActive : styles.filterBtn} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.routeGrid}>
        {items.map((route) => (
          <article key={route.id} className={styles.routeCard}>
            <div className={styles.routeThumb}>
              <MapPinned className={styles.routeThumbIcon} strokeWidth={2} />
            </div>
            <h3>{route.title}</h3>
            <div className={styles.routeTags}>
              {route.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
            <div className={styles.cardStats}>
              <span className={styles.statItem}>
                <MapPin className={`${styles.statIcon} ${styles.statIconLocation}`} strokeWidth={2} />
                {route.spots}개 장소
              </span>
              <span className={styles.statItem}>
                <Bookmark className={`${styles.statIcon} ${styles.statIconBookmark}`} strokeWidth={2} />
                {route.bookmarks}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
export default RecommendedRoutesSection;
