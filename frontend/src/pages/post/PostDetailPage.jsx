import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Save, Trash2, XCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostEntrySidebar from '@/components/post/detail/PostEntrySidebar';
import PostComparisonViewer from '@/components/post/detail/PostComparisonViewer';
import PostDiaryCard from '@/components/post/detail/PostDiaryCard';
import PostInfoSidebar from '@/components/post/detail/PostInfoSidebar';
import PostCommentSection from '@/components/post/detail/PostCommentSection';
import PostLocationModal from '@/components/post/detail/PostLocationModal';
import {
  createPostBookmark,
  createRouteComment,
  deletePostBookmark,
  deleteRouteComment,
  deleteRoutePost,
  fetchMyPostBookmarks,
  fetchRoutePostById,
  likeRoutePost,
  updateRouteComment,
  updateRoutePost,
} from '@/api/routePostApi';
import { useAuthStore } from '@/stores/useAuthStore';
import styles from '@/styles/PostDetailPage.module.css';

/*
[PostDetailPage]
- 상세 조회 + 작성자 게시글 수정/삭제 + 댓글 CRUD + 좋아요 + 북마크를 한 화면에서 처리
- 권한 규칙:
  - 게시글 수정/삭제: 작성자 본인만
  - 댓글 수정/삭제: 댓글 작성자 본인만
  - 좋아요/북마크/댓글작성: 로그인 사용자만
*/
const PostDetailPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { isLoggedIn, user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [activeEntryId, setActiveEntryId] = useState('');
  const [locationEntry, setLocationEntry] = useState(null);

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

  // 인증 응답 스키마 차이(userId/id)를 흡수해 현재 로그인 사용자를 통일해서 비교합니다.
  const currentUserId = user?.userId || user?.id || '';

  // 게시글 수정/삭제 버튼 노출 기준: "로그인 + 작성자 본인".
  const isAuthor = Boolean(
    post && currentUserId && String(post.author?.userId) === String(currentUserId),
  );

  useEffect(() => {
    let alive = true;

    const loadPost = async () => {
      // 다른 글로 이동하면 기존 편집/액션 상태를 초기화합니다.
      setIsLoading(true);
      setLoadError('');
      setActionError('');
      setLiked(false);
      setIsEditingPost(false);
      setBookmarkInfo(null);

      try {
        const found = await fetchRoutePostById(postId);

        if (!alive) return;
        setPost(found);
        setCommentInput('');

        // 북마크 여부는 상세 API가 아닌 북마크 목록 기준으로 판단합니다.
        if (found && isLoggedIn && currentUserId) {
          try {
            const bookmarks = await fetchMyPostBookmarks({ userId: currentUserId });
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
        setLoadError(error.message || '게시글을 불러오지 못했습니다.');
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

  useEffect(() => {
    const firstEntryId = post?.entries?.[0]?.id ?? '';

    // 상세 재조회로 entry 목록이 바뀌면 현재 선택 인덱스를 안전하게 재보정합니다.
    if (!post || !Array.isArray(post.entries) || post.entries.length === 0) {
      setActiveEntryId('');
      return;
    }

    const exists = post.entries.some((entry) => String(entry.id) === String(activeEntryId));
    if (!exists) {
      setActiveEntryId(firstEntryId);
    }
  }, [post, activeEntryId]);

  const activeIndex = Math.max(
    post?.entries?.findIndex((entry) => String(entry.id) === String(activeEntryId)) ?? 0,
    0,
  );

  const activeEntry = post?.entries?.[activeIndex] ?? null;

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
    // UI에서 버튼을 숨기더라도 핸들러 내부에서 권한/중복 요청을 한 번 더 차단합니다.
    if (!post || !isAuthor || isSavingPost) return;

    setActionError('');
    setIsSavingPost(true);

    try {
      const updated = await updateRoutePost({
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
      await deleteRoutePost({ postId: post.id });
      navigate('/posts');
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
      const refreshed = await likeRoutePost({ postId: post.id });
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
      // 북마크 존재 여부(bookmarkInfo)에 따라 생성/삭제를 토글합니다.
      if (bookmarkInfo?.bookmarkId) {
        await deletePostBookmark({
          bookmarkId: bookmarkInfo.bookmarkId,
          userId: currentUserId,
        });
        setBookmarkInfo(null);
      } else {
        const created = await createPostBookmark({
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
    // 비로그인 사용자는 조회만 가능, 댓글 작성은 차단합니다.
    if (!post || !isLoggedIn || isSubmittingComment) return;

    const next = commentInput.trim();
    if (!next) return;

    setActionError('');
    setIsSubmittingComment(true);

    try {
      const updated = await createRouteComment({
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
      const updated = await updateRouteComment({
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
      const updated = await deleteRouteComment({
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
      <MainLayout isMapPage={false} activeMenuKey="posts">
        <section className={styles.pageShell}>
          <div className={styles.notFoundCard}>
            <p>게시글을 불러오는 중입니다.</p>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!post || !activeEntry) {
    return (
      <MainLayout isMapPage={false} activeMenuKey="posts">
        <section className={styles.pageShell}>
          <div className={styles.notFoundCard}>
            <h1>게시물을 찾을 수 없습니다</h1>
            <p>{loadError || '요청하신 게시글이 존재하지 않습니다.'}</p>
            <button type="button" className={styles.backButton} onClick={() => navigate('/posts')}>
              <ArrowLeft size={16} />
              게시글 목록으로
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return (
    <MainLayout isMapPage={false} activeMenuKey="posts">
      <section
        className={styles.pageShell}
        style={{ '--post-detail-bg': `url(${activeEntry.userImageUrl || activeEntry.referenceImageUrl || ''})` }}>
        <div className={styles.backgroundGlow} />

        <div className={styles.pageInner}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/posts')}>
            <ArrowLeft size={16} />
            목록으로
          </button>

          <header className={styles.headerCard}>
            <p className={styles.headerEyebrow}>Post Detail</p>

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
                <p className={styles.headerSummary}>{post.summary || post.content}</p>
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

          <div className={styles.detailGrid}>
            <PostEntrySidebar
              entries={post.entries}
              activeEntryId={activeEntry.id}
              onSelectEntry={setActiveEntryId}
            />

            <main className={styles.mainColumn}>
              <PostComparisonViewer
                entries={post.entries}
                activeIndex={activeIndex}
                onPrev={() =>
                  setActiveEntryId(
                    post.entries[
                      activeIndex === 0 ? post.entries.length - 1 : activeIndex - 1
                    ].id,
                  )
                }
                onNext={() =>
                  setActiveEntryId(
                    post.entries[
                      activeIndex === post.entries.length - 1 ? 0 : activeIndex + 1
                    ].id,
                  )
                }
                onSelectIndex={(index) => setActiveEntryId(post.entries[index].id)}
                onOpenLocation={setLocationEntry}
              />

              <PostDiaryCard
                post={post}
                entry={activeEntry}
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
                hintText="이 게시물을 본 뒤 느낀 점이나 실제 방문 팁을 남길 수 있습니다."
                readOnlyMessage="로그인 후 댓글을 작성할 수 있습니다."
                placeholder="예: 같은 시간대에 가보려는데 대기 줄은 어느 정도였나요?"
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
            </main>

            <PostInfoSidebar
              post={post}
              activeEntry={activeEntry}
              onOpenLocation={setLocationEntry}
            />
          </div>
        </div>

        <PostLocationModal entry={locationEntry} onClose={() => setLocationEntry(null)} />
      </section>
    </MainLayout>
  );
};

export default PostDetailPage;
