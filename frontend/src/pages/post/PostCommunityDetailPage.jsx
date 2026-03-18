import React, { useMemo } from 'react';
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
import usePostDetailController from '@/pages/post/hooks/usePostDetailController';
import styles from '@/styles/PostDetailPage.module.css';

/*
[PostCommunityDetailPage]
- 커뮤니티 상세를 게시물 상세 컴포넌트(PostDiaryCard/PostCommentSection)로 조립
- 기능: 본인 글 수정/삭제, 댓글 CRUD, 좋아요, 북마크
*/
// 상세 공통 훅에 주입할 "커뮤니티 전용" API 어댑터입니다.
// PostDetailPage와 동일한 컨트롤러 로직을 공유하되 API만 교체합니다.
const COMMUNITY_POST_DETAIL_API = {
  fetchPostById: fetchCommunityPostById,
  fetchMyBookmarks: fetchMyCommunityBookmarks,
  updatePost: updateCommunityPost,
  deletePost: deleteCommunityPost,
  likePost: likeCommunityPost,
  createBookmark: createCommunityBookmark,
  deleteBookmark: deleteCommunityBookmark,
  createComment: createCommunityComment,
  updateComment: updateCommunityComment,
  deleteComment: deleteCommunityComment,
};

const PostCommunityDetailPage = () => {
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
    isEditingPost,
    editTitle,
    setEditTitle,
    editContent,
    setEditContent,
    isSavingPost,
    likeBusy,
    liked,
    bookmarkInfo,
    handleStartEdit,
    handleCancelEdit,
    handleSavePost,
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
    listPath: '/community',
    api: COMMUNITY_POST_DETAIL_API,
    messages: {
      loadError: '커뮤니티 게시글을 불러오지 못했습니다.',
    },
  });

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
              canManageComment={canManageComment}
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
