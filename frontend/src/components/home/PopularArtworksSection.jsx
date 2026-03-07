import React from 'react';
import { Heart, MapPin } from 'lucide-react';
import styles from '../../styles/Home.module.css';

const artworks = [
  { id: 1, title: '君の名は。', type: '애니 영화', spots: 24, posts: 1250 },
  { id: 2, title: 'スラムダンク', type: '애니', spots: 12, posts: 890 },
  { id: 3, title: '天気の子', type: '애니 영화', spots: 28, posts: 2100 },
  { id: 4, title: 'ラブライブ!', type: '애니', spots: 32, posts: 2850 },
];

const PopularArtworksSection = () => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>인기 작품</h2>
          <p>많은 덕후들이 찾는 작품</p>
        </div>
        <span className={styles.viewAll}>전체 보기 〉</span>
      </div>

      <div className={styles.horizontalRow}>
        {artworks.map((art) => (
          <article key={art.id} className={styles.artworkCard}>
            <div className={styles.artworkGradient} />
            <div className={styles.cardType}>{art.type}</div>
            <h3>{art.title}</h3>
            <div className={styles.cardStats}>
              <span className={styles.statItem}>
                <MapPin className={`${styles.statIcon} ${styles.statIconLocation}`} strokeWidth={2} />
                {art.spots}
              </span>
              <span className={styles.statItem}>
                <Heart className={`${styles.statIcon} ${styles.statIconLike}`} strokeWidth={2} />
                {art.posts}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PopularArtworksSection;
