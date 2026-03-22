import React, { useMemo, useState } from 'react';
import { Eye, Heart, MessageCircle, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockPostSummaries } from '@/data/post/postMockData';
import styles from '../../styles/Home.module.css';

const categoryByPostId = {
  '1': '후기',
  '2': '정보',
  '3': '질문',
};

const recommendedPosts = mockPostSummaries.map((post) => ({
  id: String(post.id),
  category: categoryByPostId[String(post.id)] ?? '정보',
  title: post.title,
  tagNames: Array.isArray(post.tagNames) ? post.tagNames.slice(0, 2) : [],
  author: post.userId,
  publishedAt: post.publishedAt,
  views: post.viewCount ?? 0,
  likes: post.likeCount ?? 0,
  comments: post.commentCount ?? 0,
}));

const parseDateLabel = (label) => new Date(String(label).replaceAll('.', '-')).getTime();

const RecommendedRoutesSection = () => {
  const [filter, setFilter] = useState('전체');

  const items = useMemo(() => {
    if (filter === '인기순') return [...recommendedPosts].sort((a, b) => b.likes - a.likes);
    if (filter === '최신순') {
      return [...recommendedPosts].sort((a, b) => parseDateLabel(b.publishedAt) - parseDateLabel(a.publishedAt));
    }
    return recommendedPosts;
  }, [filter]);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <div>
          <h2>추천 게시물</h2>
          <p>지금 많이 보는 성지순례 커뮤니티 글</p>
        </div>
        <div className={styles.filterRow}>
          {['전체', '인기순', '최신순'].map((item) => (
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
    </section>
  );
};

export default RecommendedRoutesSection;
