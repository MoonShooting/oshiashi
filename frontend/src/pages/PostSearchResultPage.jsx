import React, { useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import EmptyState from '../components/post-search/EmptyState';
import PostGrid from '../components/post-search/PostGrid';
import SearchHeader from '../components/post-search/SearchHeader';
import SortDropdown from '../components/post-search/SortDropdown';
import TagFilters from '../components/post-search/TagFilters';
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
