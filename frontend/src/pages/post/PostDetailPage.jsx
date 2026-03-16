import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostEntrySidebar from '@/components/post/detail/PostEntrySidebar';
import PostComparisonViewer from '@/components/post/detail/PostComparisonViewer';
import PostDiaryCard from '@/components/post/detail/PostDiaryCard';
import PostInfoSidebar from '@/components/post/detail/PostInfoSidebar';
import PostCommentSection from '@/components/post/detail/PostCommentSection';
import PostLocationModal from '@/components/post/detail/PostLocationModal';
import { getMockPostDetail } from '@/data/post/postMockData';
import {
  getStoredPostBookmark,
  removePostBookmark,
  savePostBookmark,
} from '@/data/postBookmarkStorage';
import styles from '@/styles/PostDetailPage.module.css';

const PostDetailPage = () => {
  const navigate = useNavigate();
  const { postId } = useParams();

  const post = useMemo(() => getMockPostDetail(postId), [postId]);
  const [activeEntryId, setActiveEntryId] = useState('');
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [locationEntry, setLocationEntry] = useState(null);

  useEffect(() => {
    if (!post) return;
    setActiveEntryId(post.entries[0]?.id ?? '');
    setComments(post.comments);
    setCommentInput('');
    setLiked(false);
    setBookmarked(Boolean(getStoredPostBookmark(post.id)));
  }, [post]);

  const activeIndex = Math.max(
    post?.entries.findIndex((entry) => entry.id === activeEntryId) ?? 0,
    0,
  );
  const activeEntry = post?.entries[activeIndex] ?? null;
  const likeCount = post ? post.stats.likes + (liked ? 1 : 0) : 0;

  const handleSubmitComment = () => {
    const next = commentInput.trim();
    if (!next) return;

    setComments((prev) => [
      {
        id: `new-${Date.now()}`,
        author: '나',
        avatarLabel: '나',
        timeLabel: '방금 전',
        content: next,
      },
      ...prev,
    ]);
    setCommentInput('');
  };

  const handleToggleBookmark = () => {
    if (!post) return;

    if (bookmarked) {
      removePostBookmark(post.id);
      setBookmarked(false);
      return;
    }

    savePostBookmark(post);
    setBookmarked(true);
  };

  if (!post || !activeEntry) {
    return (
      <MainLayout isMapPage={false} activeMenuKey="community">
        <section className={styles.pageShell}>
          <div className={styles.notFoundCard}>
            <h1>게시물을 찾을 수 없습니다</h1>
            <p>목업 데이터에 없는 게시물입니다. 목록에서 다시 선택해 주세요.</p>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate('/posts')}>
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
      <section
        className={styles.pageShell}
        style={{ '--post-detail-bg': `url(${activeEntry.userImageUrl})` }}>
        <div className={styles.backgroundGlow} />

        <div className={styles.pageInner}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate('/posts')}>
            <ArrowLeft size={16} />
            목록으로
          </button>

          <header className={styles.headerCard}>
            <p className={styles.headerEyebrow}>Post Detail</p>
            <h1 className={styles.headerTitle}>{post.title}</h1>
            <p className={styles.headerSummary}>{post.summary}</p>
          </header>

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
                likeCount={likeCount}
                commentCount={comments.length}
                liked={liked}
                bookmarked={bookmarked}
                onToggleLike={() => setLiked((prev) => !prev)}
                onToggleBookmark={handleToggleBookmark}
              />

              <PostCommentSection
                comments={comments}
                value={commentInput}
                onChange={setCommentInput}
                onSubmit={handleSubmitComment}
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
