import React from 'react';
import {
  Bookmark,
  CalendarDays,
  Clock3,
  Heart,
  MessageCircle,
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
  // 응답 누락 시에도 렌더링이 가능하도록 배열/문자열 기본값을 고정합니다.
  const moodTags = Array.isArray(entry?.moodTags) ? entry.moodTags : [];
  const postTagNames = Array.isArray(post?.tagNames) ? post.tagNames : [];
  const sceneNote = entry?.sceneNote || post?.content || '작성된 장면 기록이 없습니다.';

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
        </div>
      </div>

      <div className={styles.diaryContent}>
        <p className={styles.diaryLead}>{post.title}</p>
        <p className={styles.diaryParagraph}>{sceneNote}</p>

        <div className={styles.diaryInfoBar}>
          {/*
            구현 예정 기능 보존용 주석
            - 장면별 OST 노출
            - "기록된 OST 없음" 기본 문구
            현재는 OST 기능이 아직 완성되지 않아 화면에서 숨깁니다.

            <div className={styles.diaryInfoItem}>
              <Music4 size={16} />
              <span>{entry?.soundtrack || '기록된 OST 없음'}</span>
            </div>
          */}
          <div className={styles.diaryMoodTags}>
            {moodTags.map((tag) => (
              <span key={tag} className={styles.diaryTag}>
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.diaryTagList}>
          {postTagNames.map((tag) => (
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
