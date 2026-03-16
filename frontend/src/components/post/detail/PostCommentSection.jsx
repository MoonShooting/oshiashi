import React from 'react';
import { MessageCircleMore, SendHorizontal } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

const PostCommentSection = ({
  comments,
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <section className={styles.commentCard}>
      <div className={styles.commentHeader}>
        <div className={styles.commentHeaderTitle}>
          <MessageCircleMore size={18} />
          <h3>댓글 {comments.length}개</h3>
        </div>
        <p className={styles.commentHeaderHint}>
          이 게시물을 본 뒤 느낀 점이나 실제 방문 팁을 남길 수 있습니다.
        </p>
      </div>

      <form
        className={styles.commentComposer}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}>
        <textarea
          className={styles.commentTextarea}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="예: 이 장면 저도 좋아합니다. 계단은 몇 시쯤 가장 한산했는지 궁금해요."
        />
        <button type="submit" className={styles.commentSubmitButton}>
          <SendHorizontal size={16} />
          댓글 달기
        </button>
      </form>

      <div className={styles.commentList}>
        {comments.map((comment) => (
          <article key={comment.id} className={styles.commentItem}>
            <div className={styles.commentAvatar}>{comment.avatarLabel}</div>
            <div className={styles.commentBody}>
              <div className={styles.commentMetaRow}>
                <strong>{comment.author}</strong>
                <span>{comment.timeLabel}</span>
              </div>
              <p className={styles.commentText}>{comment.content}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PostCommentSection;
