import React from 'react';
import { Eye, Heart, MessageCircle } from 'lucide-react';
import styles from '../../styles/PostSearchResultPage.module.css';

// PostCard는 "화면 표현 전용" 컴포넌트입니다.
// 여기서는 API 호출이나 데이터 가공을 하지 않고,
// 부모 페이지가 넘겨준 post 모델을 그대로 렌더링하는 역할만 담당합니다.
const PostCard = ({ post }) => {
  return (
    <article className={styles.postCard}>
      <div className={styles.cardImageWrap}>
        {/* 백엔드에 대표 이미지가 있으면 출력하고, 없으면 fallback 배경을 보여줍니다. */}
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} className={styles.cardImage} loading="lazy" />
        ) : (
          <div className={styles.cardImageFallback} />
        )}
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        <p className={styles.cardPreview}>{post.content}</p>

        {/* 태그는 현재 백엔드 DTO에 없을 수 있으므로, 빈 배열이어도 안전하게 렌더링되도록 설계했습니다. */}
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
            {/* 통계 수치는 normalize 단계에서 숫자로 변환해 오므로 화면에서는 그대로 출력만 합니다. */}
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
