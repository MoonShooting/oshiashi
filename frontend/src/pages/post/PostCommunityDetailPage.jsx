import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Pencil, Save, Trash2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostDiaryCard from '@/components/post/detail/PostDiaryCard';
import PostCommentSection from '@/components/post/detail/PostCommentSection';
import {
  createCommunityBookmark,
  createCommunityComment,
  deleteCommunityBookmark,
  deleteCommunityComment,
  deleteCommunityPost,
  fetchCommunityPostById,
  fetchMyCommunityBookmarks,
  likeCommunityPost,
  updateCommunityComment,
  updateCommunityPost,
} from '@/api/communityApi';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/PostDetailPage.module.css';

/*
[PostCommunityDetailPage]
- 커뮤니티 상세를 게시물 상세 컴포넌트(PostDiaryCard/PostCommentSection)로 조립
- 기능: 본인 글 수정/삭제, 댓글 CRUD, 좋아요, 북마크
*/
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

  const [likeBusy, setLikeBusy] = useState(false);
  const [liked, setLiked] = useState(false);

  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [bookmarkInfo, setBookmarkInfo] = useState(null);

  const [actionError, setActionError] = useState('');

  const currentUserId = user?.userId || user?.id || '';
  const isAuthor = Boolean(
    post && currentUserId && String(post.author?.userId) === String(currentUserId),
  );

  useEffect(() => {
    let alive = true;

    const loadPost = async () => {
      setIsLoading(true);
      setLoadError('');
      setActionError('');
      setLiked(false);
      setIsEditingPost(false);
      setBookmarkInfo(null);

      try {
        const found = await fetchCommunityPostById(postId);

        if (!alive) return;
        setPost(found);
        setCommentInput('');

        if (found && isLoggedIn && currentUserId) {
          try {
            const bookmarks = await fetchMyCommunityBookmarks({ userId: currentUserId });
            if (!alive) return;

            const matched =
              bookmarks.find((bookmark) => String(bookmark.postId) === String(found.id)) ?? null;
            setBookmarkInfo(matched);
          } catch {
            setBookmarkInfo(null);
          }
        }
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
  }, [postId, isLoggedIn, currentUserId]);

  // PostDiaryCard에 맞추는 커뮤니티 전용 가상 entry 모델
  const diaryEntry = useMemo(
    () => ({
      id: `community-entry-${post?.id ?? '0'}`,
      title: post?.title ?? '',
      artworkTitle: '커뮤니티 자유게시판',
      address: '커뮤니티',
      referenceImageUrl: '',
      userImageUrl: '',
      sceneNote: isEditingPost ? editContent : post?.content ?? '',
      soundtrack: '기록된 OST 없음',
      visitTimeLabel: post?.publishedTimeLabel ?? '-',
      moodTags: Array.isArray(post?.tags) ? post.tags : [],
    }),
    [post, isEditingPost, editContent],
  );

  const handleStartEdit = () => {
    if (!post || !isAuthor) return;

    setEditTitle(post.title ?? '');
    setEditContent(post.content ?? '');
    setActionError('');
    setIsEditingPost(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPost(false);
    setEditTitle('');
    setEditContent('');
  };

  const handleSavePost = async () => {
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
      await deleteCommunityPost({ postId: post.id });
      navigate('/community');
    } catch (error) {
      setActionError(error.message || '게시글 삭제에 실패했습니다.');
      setIsSavingPost(false);
    }
  };

  const handleToggleLike = async () => {
    if (!post || likeBusy) return;

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setActionError('');
    setLikeBusy(true);

    try {
      const refreshed = await likeCommunityPost({ postId: post.id });
      setPost(refreshed);
      setLiked(true);
    } catch (error) {
      setActionError(error.message || '좋아요 처리에 실패했습니다.');
    } finally {
      setLikeBusy(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!post || bookmarkBusy) return;

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setActionError('');
    setBookmarkBusy(true);

    try {
      if (bookmarkInfo?.bookmarkId) {
        await deleteCommunityBookmark({
          bookmarkId: bookmarkInfo.bookmarkId,
          userId: currentUserId,
        });
        setBookmarkInfo(null);
      } else {
        const created = await createCommunityBookmark({
          postId: post.id,
          userId: currentUserId,
          bookmarkName: `${post.title} 북마크`,
        });
        setBookmarkInfo(created ?? null);
      }
    } catch (error) {
      setActionError(error.message || '북마크 처리에 실패했습니다.');
    } finally {
      setBookmarkBusy(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!post || !isLoggedIn || isSubmittingComment) return;

    const next = commentInput.trim();
    if (!next) return;

    setActionError('');
    setIsSubmittingComment(true);

    try {
      const updated = await createCommunityComment({
        postId: post.id,
        content: next,
      });

      setPost(updated);
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
    setCommentBusyId(String(commentId));

    try {
      const updated = await updateCommunityComment({
        postId: post.id,
        commentId,
        content: nextContent,
      });
      setPost(updated);
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
      const updated = await deleteCommunityComment({
        postId: post.id,
        commentId,
      });
      setPost(updated);
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
          <div className={styles.notFoundCard}>
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
      <section className={styles.pageShell} style={{ '--post-detail-bg': 'none' }}>
        <div className={styles.backgroundGlow} />

        <div className={styles.pageInner}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/community')}>
            <ArrowLeft size={16} />
            목록으로
          </button>

          <header className={styles.headerCard}>
            <p className={styles.headerEyebrow}>Community Detail</p>

            {isEditingPost ? (
              <div className={styles.postEditWrap}>
                <input
                  className={styles.postEditInput}
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="제목을 입력해 주세요."
                />
                <textarea
                  className={styles.postEditTextarea}
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  placeholder="게시글 설명을 입력해 주세요."
                />
              </div>
            ) : (
              <>
                <h1 className={styles.headerTitle}>{post.title}</h1>
                <p className={styles.headerSummary}>
                  작성자 {post.author?.name ?? '익명'} · 조회 {(post.stats?.views ?? 0).toLocaleString()} ·
                  공감 {(post.stats?.likes ?? 0).toLocaleString()}
                </p>
              </>
            )}

            {isAuthor ? (
              <div className={styles.postManageRow}>
                {isEditingPost ? (
                  <>
                    <button
                      type="button"
                      className={styles.postManageButton}
                      disabled={isSavingPost}
                      onClick={handleSavePost}>
                      <Save size={14} />
                      {isSavingPost ? '저장 중...' : '수정 저장'}
                    </button>
                    <button
                      type="button"
                      className={styles.postManageButton}
                      disabled={isSavingPost}
                      onClick={handleCancelEdit}>
                      <XCircle size={14} />
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className={styles.postManageButton} onClick={handleStartEdit}>
                      <Pencil size={14} />
                      게시글 수정
                    </button>
                    <button
                      type="button"
                      className={`${styles.postManageButton} ${styles.postManageButtonDanger}`}
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

          {actionError ? <p className={styles.postActionError}>{actionError}</p> : null}

          <div className={styles.mainColumn}>
            <PostDiaryCard
              post={post}
              entry={diaryEntry}
              likeCount={post.stats?.likes ?? 0}
              commentCount={post.comments?.length ?? 0}
              liked={liked || likeBusy}
              bookmarked={Boolean(bookmarkInfo)}
              onToggleLike={handleToggleLike}
              onToggleBookmark={handleToggleBookmark}
            />

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
        </div>
      </section>
    </MainLayout>
  );
};

export default PostCommunityDetailPage;
