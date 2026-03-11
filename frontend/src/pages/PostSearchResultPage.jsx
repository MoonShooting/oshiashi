import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, RotateCcw, SearchX, X } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import PostCard from '../components/post/PostCard';
import {
  buildMockPosts,
  DEFAULT_SELECTED_TAGS,
  SORTERS,
} from '../constants/postSearchMock';
import styles from '../styles/PostSearchResultPage.module.css';

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} thumbnail
 * @property {string[]} tags
 * @property {string} author
 * @property {number} viewCount
 * @property {number} likeCount
 * @property {number} commentCount
 * @property {string} createdAt
 */

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
    <h3>검색 결과가 없습니다</h3>
    <p>선택한 태그 조건을 변경해서 다시 찾아보세요.</p>
    <button type="button" className={styles.emptyActionBtn} onClick={onReset}>
      다른 태그 검색
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

  const allPosts = useMemo(() => buildMockPosts(), []);
  const [selectedTags, setSelectedTags] = useState([...DEFAULT_SELECTED_TAGS]);
  const [sortBy, setSortBy] = useState('latest');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadTriggerRef = useRef(null);
  const loadTimeoutRef = useRef(null);

  const filteredPosts = useMemo(() => {
    const byTag = allPosts.filter((post) =>
      selectedTags.every((tag) => post.tags.includes(tag)),
    );

    const sorter = SORTERS[sortBy] ?? SORTERS.latest;
    return [...byTag].sort(sorter);
  }, [allPosts, selectedTags, sortBy]);

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
    setSelectedTags([...DEFAULT_SELECTED_TAGS]);
    setSortBy('latest');
  };

  const searchedTag = selectedTags[0] ?? '검색';

  return (
    <MainLayout isMapPage={false} activeMenuKey="works">
      <div className={styles.pageRoot}>
        <div className={styles.pageContainer}>
          <SearchHeader searchedTag={searchedTag} resultCount={filteredPosts.length} />

          <div className={styles.controlRow}>
            <TagFilters tags={selectedTags} onRemove={handleRemoveTag} onClear={handleResetFilters} />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>

          {filteredPosts.length === 0 ? (
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
