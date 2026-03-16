import React from 'react';
import {
  Bookmark,
  CalendarDays,
  Clock3,
  Heart,
  MessageCircle,
  Share2,
  Music4,
} from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostDiaryCard = ({
  post,
  entry,
  likeCount,
  commentCount,
  liked,
  bookmarked,
  onToggleLike,
  onToggleBookmark,
}) => {
  return (
    <section className={styles.diaryCard}>
      <div className={styles.diaryHeader}>
        <div className={styles.diaryAuthorBlock}>
          <div className={styles.diaryAvatar}>{post.author.avatarLabel}</div>
          <div>
            <h2 className={styles.diaryAuthorName}>{post.author.name}</h2>
            <div className={styles.diaryMetaRow}>
              <span className={styles.diaryMetaItem}>
                <CalendarDays size={13} />
                {post.publishedDateLabel}
              </span>
              <span className={styles.diaryMetaItem}>
                <Clock3 size={13} />
                {entry.visitTimeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.diaryActions}>
          <button
            type="button"
            className={liked ? `${styles.diaryActionButton} ${styles.diaryActionButtonLiked}` : styles.diaryActionButton}
            onClick={onToggleLike}>
            <Heart size={16} />
            {likeCount}
          </button>
          <button
            type="button"
            className={
              bookmarked
                ? `${styles.diaryActionButton} ${styles.diaryActionButtonBookmarked}`
                : styles.diaryActionButton
            }
            onClick={onToggleBookmark}>
            <Bookmark size={16} />
            {bookmarked ? '북마크됨' : '북마크'}
          </button>
          <span className={styles.diaryActionButton}>
            <MessageCircle size={16} />
            {commentCount}
          </span>
          <button type="button" className={styles.diaryIconButton}>
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className={styles.diaryContent}>
        <p className={styles.diaryLead}>{post.title}</p>
        <p className={styles.diaryParagraph}>{entry.sceneNote}</p>

        <div className={styles.diaryInfoBar}>
          <div className={styles.diaryInfoItem}>
            <Music4 size={16} />
            <span>{entry.soundtrack}</span>
          </div>
          <div className={styles.diaryMoodTags}>
            {entry.moodTags.map((tag) => (
              <span key={tag} className={styles.diaryTag}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.diaryTagList}>
          {post.tags.map((tag) => (
            <span key={tag} className={styles.diaryTagSoft}>
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PostDiaryCard;
