import React from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import styles from '../../styles/PostSearchResultPage.module.css';

const PostCard = ({ post }) => {
  return (
    <article className={styles.postCard}>
      <div className={styles.cardImageWrap}>
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} className={styles.cardImage} loading="lazy" />
        ) : (
          <div className={styles.cardImageFallback} />
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <p className={styles.cardPreview}>{post.content}</p>

        <div className={styles.cardTags}>
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.cardTagChip}>
              #{tag}
            </span>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <div className={styles.authorBox}>
            <div className={styles.authorAvatar} />
            <span className={styles.authorName}>{post.author}</span>
          </div>

          <div className={styles.cardStats}>
            <span className={styles.statItem}>
              <Eye className={`${styles.statIcon} ${styles.viewIcon}`} strokeWidth={2} />
              {post.viewCount}
            </span>
            <span className={styles.statItem}>
              <Heart className={`${styles.statIcon} ${styles.likeIcon}`} strokeWidth={2} />
              {post.likeCount}
            </span>
            <span className={styles.statItem}>
              <MessageCircle className={`${styles.statIcon} ${styles.commentIcon}`} strokeWidth={2} />
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;
