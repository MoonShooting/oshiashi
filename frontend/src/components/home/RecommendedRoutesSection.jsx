import React, { useEffect, useState } from 'react';
import { Eye, Heart, MessageCircle, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchRoutePosts, routePostsUpdatedEvent } from '@/api/routePostApi';
import styles from '../../styles/Home.module.css';

const FILTER_LABELS = ['전체', '인기순', '최신순'];
const FILTER_TO_SORT = {
  전체: 'views',
  인기순: 'popular',
  최신순: 'latest',
};
const normalizeRecommendedPost = (post) => ({
  id: String(post.id),
  category: Array.isArray(post.tagNames) && post.tagNames[0] ? post.tagNames[0] : '추천',
  title: post.title,
  tagNames: Array.isArray(post.tagNames) ? post.tagNames.slice(0, 2) : [],
  author: post.userId ?? '익명',
  publishedAt: post.publishedAt ?? '',
  views: Number(post.viewCount ?? 0),
  likes: Number(post.likeCount ?? 0),
  comments: Number(post.commentCount ?? 0),
});

const RecommendedRoutesSection = () => {
  const [filter, setFilter] = useState('전체');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let alive = true;

    const loadRecommendedPosts = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextPosts = await fetchRoutePosts({
          sortBy: FILTER_TO_SORT[filter] ?? 'views',
        });

        if (!alive) return;

        setItems(nextPosts.slice(0, 3).map(normalizeRecommendedPost));
      } catch (error) {
        if (!alive) return;

        setItems([]);
        setLoadError(error.message || '추천 게시물을 불러오지 못했습니다.');
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    const handlePostsUpdated = () => {
      loadRecommendedPosts();
    };

    loadRecommendedPosts();
    window.addEventListener(routePostsUpdatedEvent, handlePostsUpdated);

    return () => {
      alive = false;
      window.removeEventListener(routePostsUpdatedEvent, handlePostsUpdated);
    };
  }, [filter]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>추천 게시물</h2>
          <p>지금 많이 보는 성지순례 게시글</p>
        </div>
        <div className={styles.filterRow}>
          {FILTER_LABELS.map((item) => (
            <button
              key={item}
              className={filter === item ? styles.filterBtnActive : styles.filterBtn}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loadError ? (
        <div className={styles.homeStateCard}>{loadError}</div>
      ) : isLoading ? (
        <div className={styles.homeStateCard}>추천 게시물을 불러오는 중입니다.</div>
      ) : items.length === 0 ? (
        <div className={styles.homeStateCard}>표시할 추천 게시물이 아직 없습니다.</div>
      ) : (
        <div className={styles.routeGrid}>
          {items.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className={`${styles.routeCard} ${styles.routeCardLink}`}>
              <div className={styles.routeThumb}>
                <span className={styles.routeThumbBadge}>{post.category}</span>
                <ScrollText className={styles.routeThumbIcon} strokeWidth={2} />
              </div>
              <h3>{post.title}</h3>
              <div className={styles.routeTags}>
                {post.tagNames.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
              <div className={styles.routeMeta}>
                {post.author}
                <span>·</span>
                {post.publishedAt}
              </div>
              <div className={styles.cardStats}>
                <span className={styles.statItem}>
                  <Eye className={`${styles.statIcon} ${styles.statIconView}`} strokeWidth={2} />
                  {post.views.toLocaleString()}
                </span>
                <span className={styles.statItem}>
                  <Heart className={`${styles.statIcon} ${styles.statIconLike}`} strokeWidth={2} />
                  {post.likes.toLocaleString()}
                </span>
                <span className={styles.statItem}>
                  <MessageCircle className={`${styles.statIcon} ${styles.statIconComment}`} strokeWidth={2} />
                  {post.comments.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecommendedRoutesSection;
