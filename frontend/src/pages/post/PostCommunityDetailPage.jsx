import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Save, Trash2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostCommentSection from '@/components/post/detail/PostCommentSection';
import {
  createCommunityComment,
  deleteCommunityPost,
  fetchCommunityPostById,
  deleteCommunityComment,
  updateCommunityComment,
  updateCommunityPost,
} from '@/api/communityApi';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/PostCommunityDetailPage.module.css';

const formatDateTime = (isoString) => {
  if (!isoString) return '-';

  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

// 커뮤니티 자유게시판 상세
// - 비로그인: 조회만 허용
// - 로그인 작성자: 게시글/댓글 수정·삭제 가능
const PostCommunityDetailPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { isLoggedIn, user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentBusyId, setCommentBusyId] = useState('');

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isSavingPost, setIsSavingPost] = useState(false);

  const [actionError, setActionError] = useState('');

  // 인증 응답 스키마 차이(userId/id)를 흡수해 현재 로그인 사용자를 통일해서 비교합니다.
  const currentUserId = user?.userId || user?.id || '';

  // 게시글 수정/삭제 버튼 노출 기준: "로그인 + 작성자 본인".
  const isAuthor = Boolean(post && currentUserId && post.author?.userId === currentUserId);

  useEffect(() => {
    // 상세 페이지 언마운트 이후 비동기 완료가 와도 setState 하지 않도록 가드합니다.
    let alive = true;

    const loadPost = async () => {
      setIsLoading(true);
      setLoadError('');
      setActionError('');
      // 다른 글로 이동하면 기존 편집 상태를 초기화합니다.
      setIsEditingPost(false);

      try {
        const found = await fetchCommunityPostById(postId);
        if (!alive) return;

        setPost(found);
        setCommentInput('');
      } catch (error) {
        if (!alive) return;

        setPost(null);
        setLoadError(error.message || '커뮤니티 게시글을 불러오지 못했습니다.');
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    loadPost();

    return () => {
      alive = false;
    };
  }, [postId]);

  const handleStartEdit = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditContent(post.content);
    setActionError('');
    setIsEditingPost(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPost(false);
    setEditTitle('');
    setEditContent('');
    setActionError('');
  };

  const handleSavePost = async () => {
    // UI에서 버튼을 숨기더라도, 핸들러 자체에서도 권한/중복요청을 한 번 더 차단합니다.
    if (!post || !isAuthor || isSavingPost) return;

    setActionError('');
    setIsSavingPost(true);

    try {
      const updated = await updateCommunityPost({
        postId: post.id,
        title: editTitle,
        content: editContent,
      });

      setPost(updated);
      setIsEditingPost(false);
    } catch (error) {
      setActionError(error.message || '게시글 수정에 실패했습니다.');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !isAuthor || isSavingPost) return;

    const confirmed = window.confirm('이 게시글을 삭제할까요? 삭제 후 복구할 수 없습니다.');
    if (!confirmed) return;

    setActionError('');
    setIsSavingPost(true);

    try {
      await deleteCommunityPost({
        postId: post.id,
      });

      navigate('/community');
    } catch (error) {
      setActionError(error.message || '게시글 삭제에 실패했습니다.');
      setIsSavingPost(false);
    }
  };

  const handleSubmitComment = async () => {
    // 비로그인 사용자는 조회만 가능, 댓글 작성은 차단합니다.
    if (!post || !isLoggedIn || isSubmittingComment) return;

    const next = commentInput.trim();
    if (!next) return;

    setActionError('');
    setIsSubmittingComment(true);

    try {
      const updatedPost = await createCommunityComment({
        postId: post.id,
        content: next,
      });

      setPost(updatedPost);
      setCommentInput('');
    } catch (error) {
      setActionError(error.message || '댓글 등록에 실패했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId, nextContent) => {
    if (!post) return;

    setActionError('');
    // 댓글별 busy 상태를 둬서 동시에 여러 수정/삭제 요청이 겹치지 않게 합니다.
    setCommentBusyId(String(commentId));

    try {
      const updatedPost = await updateCommunityComment({
        postId: post.id,
        commentId,
        content: nextContent,
      });
      setPost(updatedPost);
    } catch (error) {
      setActionError(error.message || '댓글 수정에 실패했습니다.');
    } finally {
      setCommentBusyId('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!post) return;

    setActionError('');
    setCommentBusyId(String(commentId));

    try {
      const updatedPost = await deleteCommunityComment({
        postId: post.id,
        commentId,
      });
      setPost(updatedPost);
    } catch (error) {
      setActionError(error.message || '댓글 삭제에 실패했습니다.');
    } finally {
      setCommentBusyId('');
    }
  };

  if (isLoading) {
    return (
      <MainLayout isMapPage={false} activeMenuKey="community">
        <section className={styles.pageShell}>
          <div className={styles.loadingCard}>
            <p>커뮤니티 게시글을 불러오는 중입니다.</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout isMapPage={false} activeMenuKey="community">
        <section className={styles.pageShell}>
          <div className={styles.notFoundCard}>
            <h1>게시물을 찾을 수 없습니다</h1>
            <p>{loadError || '요청하신 커뮤니티 게시글이 존재하지 않습니다.'}</p>
            <button type="button" className={styles.backButton} onClick={() => navigate('/community')}>
              <ArrowLeft size={16} />
              게시글 목록으로
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout isMapPage={false} activeMenuKey="community">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/community')}>
            <ArrowLeft size={16} />
            목록으로
          </button>

          <header className={styles.headerCard}>
            {isEditingPost ? (
              <input
                className={styles.titleInput}
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                placeholder="제목을 입력해 주세요."
              />
            ) : (
              <h1>{post.title}</h1>
            )}

            <p className={styles.headerMeta}>
              작성자 {post.author.name} · {formatDateTime(post.createdAt)} · 조회 {post.stats.views.toLocaleString()} · 공감{' '}
              {post.stats.likes.toLocaleString()}
            </p>

            {(post.tags ?? []).length > 0 ? (
              <div className={styles.tagRow}>
                {post.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            ) : null}

            {isAuthor ? (
              <div className={styles.manageRow}>
                {isEditingPost ? (
                  <>
                    <button
                      type="button"
                      className={styles.manageButton}
                      disabled={isSavingPost}
                      onClick={handleSavePost}>
                      <Save size={14} />
                      {isSavingPost ? '저장 중...' : '수정 저장'}
                    </button>
                    <button
                      type="button"
                      className={styles.manageButton}
                      disabled={isSavingPost}
                      onClick={handleCancelEdit}>
                      <XCircle size={14} />
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className={styles.manageButton} onClick={handleStartEdit}>
                      <Pencil size={14} />
                      게시글 수정
                    </button>
                    <button
                      type="button"
                      className={`${styles.manageButton} ${styles.manageButtonDanger}`}
                      disabled={isSavingPost}
                      onClick={handleDeletePost}>
                      <Trash2 size={14} />
                      게시글 삭제
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </header>

          <article className={styles.contentCard}>
            <h2>내용</h2>
            {isEditingPost ? (
              <textarea
                className={styles.contentTextarea}
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                placeholder="내용을 입력해 주세요."
              />
            ) : (
              <p>{post.content}</p>
            )}
          </article>

          {actionError ? <p className={styles.actionError}>{actionError}</p> : null}

          <PostCommentSection
            comments={post.comments ?? []}
            value={commentInput}
            onChange={setCommentInput}
            onSubmit={handleSubmitComment}
            canComment={isLoggedIn}
            hintText="서로 예의를 지키며 댓글을 남겨 주세요."
            readOnlyMessage="로그인 후 댓글을 작성할 수 있습니다."
            placeholder="커뮤니티 글을 보고 느낀 점을 남겨 주세요."
            submitLabel={isSubmittingComment ? '등록 중...' : '댓글 달기'}
            canManageComment={(comment) =>
              // 댓글도 게시글과 동일하게 "본인 작성분만 수정/삭제" 정책을 적용합니다.
              Boolean(
                isLoggedIn &&
                  currentUserId &&
                  comment?.authorId &&
                  String(comment.authorId) === String(currentUserId),
              )
            }
            onEditComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            isCommentBusy={(commentId) => String(commentBusyId) === String(commentId)}
          />
        </div>
      </section>
    </MainLayout>
  );
};

export default PostCommunityDetailPage;
