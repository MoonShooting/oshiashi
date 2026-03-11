import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, SearchX, X } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import { getPostsAPI, normalizePostsResponse } from '../api/posts';
import styles from '../styles/PostSearchResultPage.module.css';

// 페이지 내부 정렬 규칙입니다.
// 서버에서 정렬을 맡기기 전까지는 프론트에서 동일한 기준으로 보여주기 위해
// 화면 레벨에서 정렬 함수를 고정합니다.
const DEFAULT_SORT = 'latest';

const SORTERS = {
  latest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  popular: (a, b) => b.likeCount - a.likeCount,
  views: (a, b) => b.viewCount - a.viewCount,
};

// 검색 결과 헤더/필터/정렬은 현재 이 페이지에서만 사용하는 전용 UI입니다.
// 공용 컴포넌트 디렉토리로 빼기보다 페이지 내부에 두는 편이 책임이 더 분명합니다.
const SearchHeader = ({ searchedTag, resultCount }) => (
  <section className={styles.searchHeader}>
    <h2 className={styles.searchTitle}>#{searchedTag} 검색 결과</h2>
    <p className={styles.searchCount}>총 {resultCount.toLocaleString()}개의 게시글</p>
  </section>
);

const TagFilters = ({ tags, onRemove, onClear }) => (
  <section className={styles.tagFilterRow}>
    <div className={styles.tagList}>
      {tags.map((tag) => (
        <button
          key={tag}
          className={styles.activeTagChip}
          onClick={() => onRemove(tag)}
          type="button"
          aria-label={`${tag} 태그 제거`}>
          <span>#{tag}</span>
          <X className={styles.tagRemoveIcon} strokeWidth={2.2} />
        </button>
      ))}
    </div>
    <button className={styles.resetFilterBtn} onClick={onClear} type="button">
      <RotateCcw className={styles.resetIcon} strokeWidth={2} />
      필터 초기화
    </button>
  </section>
);

const SortDropdown = ({ value, onChange }) => (
  <div className={styles.sortWrapper}>
    <label htmlFor="post-sort" className={styles.sortLabel}>
      정렬
    </label>
    <div className={styles.sortSelectWrapper}>
      <select
        id="post-sort"
        className={styles.sortSelect}
        value={value}
        onChange={(event) => onChange(event.target.value)}>
        <option value="latest">최신순</option>
        <option value="popular">인기순</option>
        <option value="views">조회순</option>
      </select>
      <ChevronDown className={styles.sortChevron} strokeWidth={2} />
    </div>
  </div>
);

const EmptyState = ({ onReset }) => (
  <section className={styles.emptyState}>
    <SearchX className={styles.emptyIcon} strokeWidth={1.8} />
    <h3>조회 가능한 게시글이 없습니다</h3>
    <p>필터를 초기화하거나, 게시글 데이터가 준비된 뒤 다시 확인해 주세요.</p>
    <button type="button" className={styles.emptyActionBtn} onClick={onReset}>
      게시글 다시 보기
    </button>
  </section>
);

// API 요청이 실패했을 때는 빈 화면보다 재시도 동선을 명확하게 보여주는 편이 낫습니다.
const ErrorState = ({ message, onRetry }) => (
  <section className={styles.emptyState}>
    <SearchX className={styles.emptyIcon} strokeWidth={1.8} />
    <h3>게시글을 불러오지 못했습니다</h3>
    <p>{message}</p>
    <button type="button" className={styles.emptyActionBtn} onClick={onRetry}>
      다시 시도
    </button>
  </section>
);

const PostGrid = ({ posts, loading }) => (
  <section className={styles.postGridSection}>
    <div className={styles.postGrid}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {loading
        ? Array.from({ length: 3 }).map((_, idx) => (
            <div key={`skeleton-${idx}`} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLineLg} />
                <div className={styles.skeletonLineMd} />
                <div className={styles.skeletonLineSm} />
              </div>
            </div>
          ))
        : null}
    </div>
  </section>
);

const PostSearchResultPage = () => {
  const PAGE_SIZE = 9;
  const LOAD_SIZE = 6;
  const LOAD_DELAY_MS = 500;

  // 전체 게시글 원본 배열입니다.
  // 백엔드 응답을 받아 한 번 정규화한 뒤 이 상태에 저장합니다.
  const [allPosts, setAllPosts] = useState([]);

  // 현재 화면은 태그 필터 UI를 유지하고 있으므로,
  // 백엔드가 태그 검색을 아직 제공하지 않아도 프론트 기준 필터는 동작하도록 둡니다.
  const [selectedTags, setSelectedTags] = useState([]);

  // 정렬은 최신순을 기본값으로 둡니다.
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTriggerRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  // 페이지 진입 시 DB의 게시글 목록을 조회합니다.
  // mock 데이터는 완전히 제거하고, API 응답만 화면 소스로 사용합니다.
  const fetchPosts = async () => {
    setIsInitialLoading(true);
    setErrorMessage('');

    try {
      const response = await getPostsAPI();
      const posts = normalizePostsResponse(response);
      setAllPosts(posts);
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
      setErrorMessage(error.message || '잠시 후 다시 시도해 주세요.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 전체 게시글 -> 태그 필터 -> 정렬 순서로 화면 목록을 계산합니다.
  // 이 계산 결과는 렌더링 직전에만 사용하고, 별도 상태로 중복 저장하지 않습니다.
  const filteredPosts = (() => {
    const byTag = allPosts.filter((post) =>
      selectedTags.length === 0 || selectedTags.every((tag) => post.tags.includes(tag)),
    );

    const sorter = SORTERS[sortBy] ?? SORTERS.latest;
    return [...byTag].sort(sorter);
  })();

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedTags, sortBy]);

  useEffect(() => {
    const node = loadTriggerRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || isLoadingMore) return;

        setIsLoadingMore(true);
        loadTimeoutRef.current = window.setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + LOAD_SIZE, filteredPosts.length));
          setIsLoadingMore(false);
        }, LOAD_DELAY_MS);
      },
      { rootMargin: '280px 0px' },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [hasMore, isLoadingMore, filteredPosts.length]);

  const handleRemoveTag = (tag) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const handleResetFilters = () => {
    setSelectedTags([]);
    setSortBy(DEFAULT_SORT);
  };

  const searchedTag = selectedTags[0] ?? '게시글';

  return (
    <MainLayout isMapPage={false} activeMenuKey="works">
      <div className={styles.pageRoot}>
        <div className={styles.pageContainer}>
          <SearchHeader searchedTag={searchedTag} resultCount={filteredPosts.length} />

          <div className={styles.controlRow}>
            <TagFilters tags={selectedTags} onRemove={handleRemoveTag} onClear={handleResetFilters} />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {isInitialLoading ? (
            <PostGrid posts={[]} loading />
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={fetchPosts} />
          ) : filteredPosts.length === 0 ? (
            <EmptyState onReset={handleResetFilters} />
          ) : (
            <>
              <PostGrid posts={visiblePosts} loading={isLoadingMore} />
              <div ref={loadTriggerRef} className={styles.infiniteTrigger} aria-hidden="true" />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PostSearchResultPage;
