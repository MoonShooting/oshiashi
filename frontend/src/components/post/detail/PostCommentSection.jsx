import React, { useEffect, useState } from 'react';
import { MessageCircleMore, Pencil, SendHorizontal, Trash2 } from 'lucide-react';
import styles from '@/styles/PostDetailPage.module.css';

/**
 * 게시글 댓글 영역 공통 컴포넌트
 * - 댓글 목록 표시
 * - 댓글 작성
 * - (권한이 있을 때) 댓글 수정/삭제
 *
 * 실제 API 호출은 부모에서 수행하고, 이 컴포넌트는 UI/입력 상태만 담당합니다.
 */
const PostCommentSection = ({
  comments,
  value,
  onChange,
  onSubmit,
  canComment = true,
  hintText = '이 게시물을 본 뒤 느낀 점이나 실제 방문 팁을 남길 수 있습니다.',
  readOnlyMessage = '댓글 작성은 로그인 후 이용할 수 있습니다.',
  placeholder = '예: 이 장면 저도 좋아합니다. 계단은 몇 시쯤 가장 한산했는지 궁금해요.',
  submitLabel = '댓글 달기',
  canManageComment = () => false,
  onEditComment,
  onDeleteComment,
  isCommentBusy = () => false,
}) => {
  // "어떤 댓글을 수정 중인지"를 컴포넌트 내부에서 관리합니다.
  const [editingCommentId, setEditingCommentId] = useState('');
  const [editingContent, setEditingContent] = useState('');
  // 부모 busy 상태와 별개로, 이 컴포넌트 내부 요청 중복도 막기 위한 로컬 busy 값입니다.
  const [localBusyCommentId, setLocalBusyCommentId] = useState('');

  useEffect(() => {
    if (!editingCommentId) return;

    // 서버 재조회로 목록이 바뀌었을 때, 사라진 댓글 편집 상태를 자동 해제합니다.
    const exists = comments.some((comment) => String(comment.id) === String(editingCommentId));
    if (!exists) {
      setEditingCommentId('');
      setEditingContent('');
    }
  }, [comments, editingCommentId]);

  const isBusy = (commentId) =>
    Boolean(isCommentBusy(commentId) || String(localBusyCommentId) === String(commentId));

  const handleStartEdit = (comment) => {
    setEditingCommentId(String(comment.id));
    setEditingContent(comment.content ?? '');
  };

  const handleCancelEdit = () => {
    setEditingCommentId('');
    setEditingContent('');
  };

  const handleSaveEdit = async (commentId) => {
    const next = editingContent.trim();
    if (!next || !onEditComment) return;

    setLocalBusyCommentId(String(commentId));

    try {
      await onEditComment(commentId, next);
      setEditingCommentId('');
      setEditingContent('');
    } finally {
      setLocalBusyCommentId('');
    }
  };

  const handleDelete = async (commentId) => {
    if (!onDeleteComment) return;

    // 삭제는 복구가 어렵기 때문에 최소 확인 팝업을 둡니다.
    const confirmed = window.confirm('댓글을 삭제할까요?');
    if (!confirmed) return;

    setLocalBusyCommentId(String(commentId));

    try {
      await onDeleteComment(commentId);
      if (String(editingCommentId) === String(commentId)) {
        setEditingCommentId('');
        setEditingContent('');
      }
    } finally {
      setLocalBusyCommentId('');
    }
  };

  return (
    <section className={styles.commentCard}>
      <div className={styles.commentHeader}>
        <div className={styles.commentHeaderTitle}>
          <MessageCircleMore size={18} />
          <h3>댓글 {comments.length}개</h3>
        </div>
        <p className={styles.commentHeaderHint}>{hintText}</p>
      </div>

      {canComment ? (
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
            placeholder={placeholder}
          />
          <button type="submit" className={styles.commentSubmitButton}>
            <SendHorizontal size={16} />
            {submitLabel}
          </button>
        </form>
      ) : (
        <div className={styles.commentReadonlyNotice}>{readOnlyMessage}</div>
      )}

      <div className={styles.commentList}>
        {comments.map((comment) => {
          const canManage = canManageComment(comment);
          const commentBusy = isBusy(comment.id);
          const isEditing = String(editingCommentId) === String(comment.id);

          return (
            <article key={comment.id} className={styles.commentItem}>
              <div className={styles.commentAvatar}>{comment.avatarLabel}</div>
              <div className={styles.commentBody}>
                <div className={styles.commentMetaRow}>
                  <strong>{comment.author}</strong>
                  <span>{comment.timeLabel}</span>
                </div>

                {isEditing ? (
                  <div className={styles.commentEditWrap}>
                    <textarea
                      className={styles.commentEditTextarea}
                      value={editingContent}
                      onChange={(event) => setEditingContent(event.target.value)}
                    />
                    <div className={styles.commentEditActions}>
                      <button
                        type="button"
                        className={styles.commentEditCancelButton}
                        disabled={commentBusy}
                        onClick={handleCancelEdit}>
                        취소
                      </button>
                      <button
                        type="button"
                        className={styles.commentEditSaveButton}
                        disabled={commentBusy}
                        onClick={() => handleSaveEdit(comment.id)}>
                        {commentBusy ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={styles.commentText}>{comment.content}</p>
                )}

                {canManage ? (
                  <div className={styles.commentActions}>
                    {!isEditing ? (
                      <button
                        type="button"
                        className={styles.commentActionButton}
                        disabled={commentBusy}
                        onClick={() => handleStartEdit(comment)}>
                        <Pencil size={12} />
                        수정
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={`${styles.commentActionButton} ${styles.commentActionDanger}`}
                      disabled={commentBusy}
                      onClick={() => handleDelete(comment.id)}>
                      <Trash2 size={12} />
                      {commentBusy ? '처리 중...' : '삭제'}
                    </button>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PostCommentSection;
