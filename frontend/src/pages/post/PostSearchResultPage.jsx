import React, { useCallback, useState } from 'react';
import { ChevronDown, Search, SearchX, SquarePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/post/PostCard';
import { useAuthStore } from '@/stores/useAuthStore';
import { communityPostsUpdatedEvent, fetchCommunityPosts } from '@/api/communityApi';
import usePostListLoader from '@/pages/post/hooks/usePostListLoader';
import styles from '@/styles/PostSearchResultPage.module.css';

// 실제로는 커뮤니티 자유게시판 목록 페이지 역할(/community)
const PostSearchResultPage = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuthStore();
  const [sortBy, setSortBy] = useState('latest');
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 목록 로딩 조건(search/sort)을 하나의 콜백으로 묶어 공통 훅에 주입합니다.
  const loadCommunityPosts = useCallback(
    () =>
      fetchCommunityPosts({
        search: searchKeyword,
        sortBy,
      }),
    [searchKeyword, sortBy],
  );

  // 로딩/에러/이벤트 재조회 보일러플레이트는 공통 훅으로 위임합니다.
  const { posts, isLoading, loadError } = usePostListLoader({
    loadPosts: loadCommunityPosts,
    updatedEventName: communityPostsUpdatedEvent,
    fallbackErrorMessage: '커뮤니티 글을 불러오지 못했습니다.',
  });

  return (
    <MainLayout isMapPage={false} activeMenuKey="community">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <header className={styles.searchHeader}>
            <div>
              <h2>커뮤니티 자유게시판</h2>
              <p>
                루트와 별개로 자유롭게 후기를 공유하는 게시판입니다.
                <span className={styles.headerHint}>총 {posts.length}건</span>
              </p>
            </div>

            {isLoggedIn ? (
              // 비로그인 사용자는 커뮤니티 열람만 가능하고 작성은 숨깁니다.
              <button type="button" className={styles.createButton} onClick={() => navigate('/community/create')}>
                <SquarePen size={16} />
                게시글 작성
              </button>
            ) : null}
          </header>

          <div className={styles.controlRow}>
            <form
              className={styles.searchWrap}
              onSubmit={(event) => {
                event.preventDefault();
                setSearchKeyword(searchInput.trim());
              }}>
              <Search className={styles.searchIcon} strokeWidth={2} />
              <input
                className={styles.searchInput}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="제목, 내용, 태그 검색"
              />
              <button type="submit" className={styles.searchButton}>
                검색
              </button>
            </form>

            <div className={styles.sortWrap}>
              <label htmlFor="community-sort">정렬</label>
              <div className={styles.sortField}>
                <select
                  id="community-sort"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className={styles.sortSelect}>
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="views">조회순</option>
                </select>
                <ChevronDown className={styles.sortIcon} strokeWidth={2} />
              </div>
            </div>
          </div>

          {loadError ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <SearchX className={styles.emptyIcon} strokeWidth={2} />
              </div>
              <strong>커뮤니티 목록을 불러오지 못했습니다.</strong>
              <p>{loadError}</p>
            </div>
          ) : isLoading ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <Search className={styles.emptyIcon} strokeWidth={2} />
              </div>
              <strong>게시글을 불러오는 중입니다.</strong>
              <p>잠시만 기다려 주세요.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <SearchX className={styles.emptyIcon} strokeWidth={2} />
              </div>
              <strong>조건에 맞는 커뮤니티 글이 없습니다.</strong>
              <p>검색어를 바꿔 다시 확인해 보세요.</p>
            </div>
          ) : (
            <div className={styles.postList}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  variant="compact"
                  category="커뮤니티"
                  title={post.title}
                  author={post.userId}
                  viewCount={post.viewCount}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  publishedAt={post.publishedAt}
                  onClick={() => navigate(`/community/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default PostSearchResultPage;
