import React, { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
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
import usePostDetailController from '@/pages/post/hooks/usePostDetailController';
import styles from '@/styles/PostDetailPage.module.css';

/*
[PostDetailPage]
- 상세 조회 + 작성자 게시글 수정/삭제 + 댓글 CRUD + 좋아요 + 북마크를 한 화면에서 처리
- 권한 규칙:
  - 게시글 수정/삭제: 작성자 본인만
  - 댓글 수정/삭제: 댓글 작성자 본인만
  - 좋아요/북마크/댓글작성: 로그인 사용자만
*/
// 상세 공통 훅에 주입할 "일반 게시물 전용" API 어댑터입니다.
// 페이지는 이 어댑터만 바꾸면 동일한 컨트롤러 로직을 재사용할 수 있습니다.
const ROUTE_POST_DETAIL_API = {
  fetchPostById: fetchRoutePostById,
  fetchMyBookmarks: fetchMyPostBookmarks,
  updatePost: updateRoutePost,
  deletePost: deleteRoutePost,
  likePost: likeRoutePost,
  createBookmark: createPostBookmark,
  deleteBookmark: deletePostBookmark,
  createComment: createRouteComment,
  updateComment: updateRouteComment,
  deleteComment: deleteRouteComment,
};

const PostDetailPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { isLoggedIn, user } = useAuthStore();

  const {
    post,
    isLoading,
    loadError,
    actionError,
    isAuthor,
    commentInput,
    setCommentInput,
    isSubmittingComment,
    commentBusyId,
    isSavingPost,
    likeBusy,
    liked,
    bookmarkInfo,
    handleDeletePost,
    handleToggleLike,
    handleToggleBookmark,
    handleSubmitComment,
    handleUpdateComment,
    handleDeleteComment,
    canManageComment,
  } = usePostDetailController({
    postId,
    isLoggedIn,
    user,
    navigate,
    listPath: '/posts',
    api: ROUTE_POST_DETAIL_API,
  });

  const [activeEntryId, setActiveEntryId] = useState('');
  const [locationEntry, setLocationEntry] = useState(null);

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
            <>
              <h1 className={styles.headerTitle}>{post.title}</h1>
              <p className={styles.headerSummary}>{post.summary || post.content}</p>
            </>

            {isAuthor ? (
              <div className={styles.postManageRow}>
                <>
                  <button
                    type="button"
                    className={styles.postManageButton}
                    onClick={() => navigate(`/posts/${post.id}/edit`)}>
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
              </div>
            ) : null}
          </header>

          {actionError ? <p className={styles.postActionError}>{actionError}</p> : null}

          <div className={styles.detailLayout}>
            {/* 비교 뷰어는 상세 페이지의 핵심 컨텐츠라 상단 풀폭으로 먼저 노출한다. */}
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

            <div className={styles.contentGrid}>
              <main className={styles.mainColumn}>
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
                  canManageComment={canManageComment}
                  onEditComment={handleUpdateComment}
                  onDeleteComment={handleDeleteComment}
                  isCommentBusy={(commentId) => String(commentBusyId) === String(commentId)}
                />
              </main>

              <aside className={styles.secondaryColumn}>
                <PostEntrySidebar
                  entries={post.entries}
                  activeEntryId={activeEntry.id}
                  onSelectEntry={setActiveEntryId}
                />
                <PostInfoSidebar post={post} />
              </aside>
            </div>
          </div>
        </div>

        <PostLocationModal entry={locationEntry} onClose={() => setLocationEntry(null)} />
      </section>
    </MainLayout>
  );
};

export default PostDetailPage;
