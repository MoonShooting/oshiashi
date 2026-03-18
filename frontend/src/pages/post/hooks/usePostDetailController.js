import { useEffect, useState } from 'react';

const DEFAULT_MESSAGES = {
  loadError: '게시글을 불러오지 못했습니다.',
  savePostError: '게시글 수정에 실패했습니다.',
  deletePostError: '게시글 삭제에 실패했습니다.',
  likeError: '좋아요 처리에 실패했습니다.',
  bookmarkError: '북마크 처리에 실패했습니다.',
  createCommentError: '댓글 등록에 실패했습니다.',
  updateCommentError: '댓글 수정에 실패했습니다.',
  deleteCommentError: '댓글 삭제에 실패했습니다.',
  deleteConfirm: '이 게시글을 삭제할까요? 삭제 후 복구할 수 없습니다.',
};

const resolveCurrentUserId = (user) => user?.userId || user?.id || '';

const toErrorMessage = (error, fallback) => error?.message || fallback;

/**
 * 게시글 상세 공통 컨트롤러 훅
 * - 로딩/에러 상태
 * - 게시글 수정/삭제
 * - 댓글 CRUD
 * - 좋아요/북마크 토글
 *
 * 상세 페이지별 차이는 api 어댑터(함수 집합)와 메시지로 주입합니다.
 */
export const usePostDetailController = ({
  postId,
  isLoggedIn,
  user,
  navigate,
  listPath,
  api,
  messages = {},
}) => {
  const mergedMessages = { ...DEFAULT_MESSAGES, ...messages };

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

  const currentUserId = resolveCurrentUserId(user);
  const isAuthor = Boolean(
    post && currentUserId && String(post.author?.userId) === String(currentUserId),
  );

  useEffect(() => {
    let alive = true;

    const loadPost = async () => {
      // 상세 전환 시 이전 액션 상태를 먼저 초기화합니다.
      setIsLoading(true);
      setLoadError('');
      setActionError('');
      setLiked(false);
      setIsEditingPost(false);
      setBookmarkInfo(null);

      try {
        const found = await api.fetchPostById(postId);

        if (!alive) return;

        setPost(found);
        setCommentInput('');

        // 북마크 존재 여부는 상세 응답이 아닌 "내 북마크 목록" 기준으로 판정합니다.
        if (found && isLoggedIn && currentUserId && api.fetchMyBookmarks) {
          try {
            const bookmarks = await api.fetchMyBookmarks({ userId: currentUserId });
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
        setLoadError(toErrorMessage(error, mergedMessages.loadError));
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
  }, [postId, isLoggedIn, currentUserId, api, mergedMessages.loadError]);

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
      const updated = await api.updatePost({
        postId: post.id,
        title: editTitle,
        content: editContent,
      });

      setPost(updated);
      setIsEditingPost(false);
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.savePostError));
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !isAuthor || isSavingPost) return;

    const confirmed = window.confirm(mergedMessages.deleteConfirm);
    if (!confirmed) return;

    setActionError('');
    setIsSavingPost(true);

    try {
      await api.deletePost({ postId: post.id });
      navigate(listPath);
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.deletePostError));
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
      const refreshed = await api.likePost({ postId: post.id });
      setPost(refreshed);
      setLiked(true);
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.likeError));
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
        await api.deleteBookmark({
          bookmarkId: bookmarkInfo.bookmarkId,
          userId: currentUserId,
        });
        setBookmarkInfo(null);
      } else {
        const created = await api.createBookmark({
          postId: post.id,
          userId: currentUserId,
          bookmarkName: `${post.title} 북마크`,
        });

        setBookmarkInfo(created ?? null);
      }
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.bookmarkError));
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
      const updated = await api.createComment({
        postId: post.id,
        content: next,
      });

      setPost(updated);
      setCommentInput('');
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.createCommentError));
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId, nextContent) => {
    if (!post) return;

    setActionError('');
    setCommentBusyId(String(commentId));

    try {
      const updated = await api.updateComment({
        postId: post.id,
        commentId,
        content: nextContent,
      });

      setPost(updated);
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.updateCommentError));
    } finally {
      setCommentBusyId('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!post) return;

    setActionError('');
    setCommentBusyId(String(commentId));

    try {
      const updated = await api.deleteComment({
        postId: post.id,
        commentId,
      });

      setPost(updated);
    } catch (error) {
      setActionError(toErrorMessage(error, mergedMessages.deleteCommentError));
    } finally {
      setCommentBusyId('');
    }
  };

  const canManageComment = (comment) =>
    Boolean(
      isLoggedIn &&
        currentUserId &&
        comment?.authorId &&
        String(comment.authorId) === String(currentUserId),
    );

  return {
    post,
    setPost,
    isLoading,
    loadError,
    actionError,

    currentUserId,
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
  };
};

export default usePostDetailController;
