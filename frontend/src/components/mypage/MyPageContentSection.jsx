import React from 'react';
import { Bookmark, FileText, MapPinned, Trophy } from 'lucide-react';
import PostCard from '@/components/post/PostCard';
import MyPageRouteList from '@/components/mypage/MyPageRouteList';
import styles from '@/styles/MyPage.module.css';

const MyPageContentSection = ({
  activeTab,
  copy,
  isLoading,
  loadError,
  issues,
  activeItems,
  myPosts,
  onNavigateToPost,
  onNavigateToAchievements,
}) => {
  const renderContent = () => {
    if (activeTab === 'achievements') {
      return (
        <div className={styles.achievementPreview}>
          <div className={styles.emptyIconWrap}>
            <Trophy className={styles.emptyIcon} strokeWidth={2} />
          </div>
          <div className={styles.achievementPreviewText}>
            <strong>나의 업적 미리보기</strong>
            <p>업적 요약은 이 영역에서 먼저 확인하고, 상세 업적 목록은 `업적 전체보기` 버튼으로 전용 페이지에서 이어서 확인합니다.</p>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <strong>{copy.title} 정보를 불러오는 중입니다.</strong>
          <p>서버 응답이 도착하면 이 영역에 최신 데이터가 표시됩니다.</p>
        </div>
      );
    }

    if (loadError && activeItems.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <Trophy className={styles.emptyIcon} strokeWidth={2} />
          </div>
          <strong>데이터를 불러오지 못했습니다.</strong>
          <p>{loadError}</p>
        </div>
      );
    }

    if (activeItems.length === 0) {
      const EmptyIcon = activeTab === 'spots' ? MapPinned : activeTab === 'posts' ? FileText : Bookmark;
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <EmptyIcon className={styles.emptyIcon} strokeWidth={2} />
          </div>
          <strong>{copy.emptyTitle}</strong>
          <p>{copy.emptyDescription}</p>
        </div>
      );
    }

    if (activeTab === 'posts') {
      return (
        <div className={styles.postGrid}>
          {myPosts.map((post) => (
            <PostCard
              key={post.id}
              title={post.title}
              excerpt={post.excerpt}
              category={post.category}
              author={post.author}
              publishedAt={post.publishedAt}
              tagNames={post.tagNames}
              viewCount={post.viewCount}
              likeCount={post.likeCount}
              imageUrl={post.imageUrl}
              variant="minimal"
              onClick={() => onNavigateToPost(post.path)}
            />
          ))}
        </div>
      );
    }

    return <MyPageRouteList items={activeItems} isBookmark={activeTab === 'bookmarks'} />;
  };

  return (
    <section className={styles.contentCard}>
      <div className={styles.contentHeaderRow}>
        <div className={styles.contentHeader}>
          <h3>{activeTab === 'achievements' ? '업적' : copy.title}</h3>
          <p>
            {activeTab === 'achievements'
              ? '마이페이지 안에서는 업적 미리보기만 보여주고, 전체 목록은 별도 페이지에서 확인합니다.'
              : copy.description}
          </p>
        </div>

        {activeTab === 'achievements' ? (
          <button type="button" className={styles.previewActionButton} onClick={onNavigateToAchievements}>
            업적 전체보기
          </button>
        ) : null}
      </div>

      {issues.length > 0 && !isLoading ? (
        <div className={styles.issueBanner}>
          <strong>일부 정보는 아직 불러오지 못했습니다.</strong>
          <p>{issues.join(' ')}</p>
        </div>
      ) : null}

      {renderContent()}
    </section>
  );
};

export default MyPageContentSection;
