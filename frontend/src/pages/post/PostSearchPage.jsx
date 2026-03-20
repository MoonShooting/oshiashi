import React, { useCallback, useMemo, useState } from 'react';
import { ChevronDown, Hash, Search, SearchX } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/post/PostCard';
import SearchInputPanel from '@/components/search/SearchInputPanel';
import { fetchRoutePosts, routePostsUpdatedEvent } from '@/api/routePostApi';
import usePostListLoader from '@/pages/post/hooks/usePostListLoader';
import styles from '@/styles/PostSearchPage.module.css';

// 사용자가 "#도쿄", "도쿄", " 도쿄 "처럼 입력해도
// 내부 비교는 항상 같은 기준으로 처리되도록 정규화합니다.
const normalizeKeyword = (value) => value.replace(/^#/, '').trim();
const parseTagInput = (value) =>
  value
    .split(',')
    .map((item) => normalizeKeyword(item))
    .filter(Boolean);

/*
[PostSearchPage]
- URL query(tags) + 정렬(sortBy)을 기준으로 목록을 조회
- routePostApi의 변경 이벤트(route-posts-changed)를 구독해 자동 재조회
- 상태: 로딩/에러/빈결과를 분리 노출
*/
const PostSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('views');
  const [inputValue, setInputValue] = useState('');

  /**
   * 화면 흐름
   * 1. 사용자는 작품 탐색 페이지에서 작품을 선택하거나, tags query가 포함된 링크로 이 페이지에 진입합니다.
   * 2. 페이지는 현재 선택된 태그와 정렬값을 기준으로 어떤 결과를 보여줄지 표현합니다.
   * 3. 백엔드 목록 API를 호출해 route 게시글(routeId != null)만 렌더링합니다.
   * 4. 사용자는 태그 추가/제거, 정렬 변경, 게시글 상세 진입을 수행합니다.
   */
  const selectedTags = useMemo(() => {
    const raw = searchParams.get('tags') ?? '';
    return raw
      .split(',')
      .map((item) => normalizeKeyword(item))
      .filter(Boolean);
  }, [searchParams]);

  // 목록 로딩 조건(tags/sort)을 하나의 콜백으로 묶어 공통 훅에 주입합니다.
  const loadRoutePosts = useCallback(
    () =>
      fetchRoutePosts({
        tags: selectedTags,
        sortBy,
      }),
    [selectedTags, sortBy],
  );

  // 로딩/에러/이벤트 재조회 보일러플레이트는 공통 훅으로 위임합니다.
  const { posts, isLoading, loadError } = usePostListLoader({
    loadPosts: loadRoutePosts,
    updatedEventName: routePostsUpdatedEvent,
    fallbackErrorMessage: '게시글 목록을 불러오지 못했습니다.',
  });

  const updateTags = (tags) => {
    // 조회 페이지는 TMDB를 직접 조회하지 않고 tags query만 상태의 기준으로 삼습니다.
    // 이렇게 두면 작품 탐색 페이지에서 넘어온 검색 조건을 URL만으로 복원할 수 있습니다.
    const next = new URLSearchParams(searchParams);

    if (tags.length > 0) {
      next.set('tags', tags.join(','));
    } else {
      next.delete('tags');
    }

    setSearchParams(next);
  };

  const handleAddTag = () => {
    const nextTags = parseTagInput(inputValue);
    if (nextTags.length === 0) return;

    // 입력창은 쉼표 단위 다중 입력을 허용하지만,
    // 실제 검색 상태는 중복 없는 태그 집합처럼 유지합니다.
    updateTags(Array.from(new Set([...selectedTags, ...nextTags])));
    setInputValue('');
  };

  const handleRemoveTag = (tag) => {
    updateTags(selectedTags.filter((item) => item !== tag));
  };

  const handleReset = () => {
    // 필터 초기화는 검색 결과 페이지를 "태그가 없는 기본 상태"로 되돌리는 역할입니다.
    updateTags([]);
    setInputValue('');
  };

  const title = selectedTags.length > 0 ? `#${selectedTags.join(' #')} 검색 결과` : '게시글 검색 결과';

  return (
    <MainLayout isMapPage={false} activeMenuKey="posts">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <header className={styles.searchHeader}>
            <h2>{title}</h2>
            <p>총 {posts.length}개의 게시글</p>
          </header>

          <div className={styles.controlRow}>
            <div className={styles.controlLeft}>
              <SearchInputPanel
                inputId="post-search-tag-input"
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleAddTag}
                placeholder="#도쿄, #토라도라, #아키하바라"
                helperText="태그를 직접 추가해 게시글 목록을 다시 조회합니다."
                submitLabel="태그 추가"
                selectedItems={selectedTags}
                onRemoveItem={handleRemoveTag}
                onReset={selectedTags.length > 0 ? handleReset : undefined}
                leadingIcon={Hash}
                submitIcon={Search}
              />
            </div>

            <div className={styles.sortWrap}>
              <label htmlFor="post-sort">정렬</label>
              <div className={styles.sortField}>
                <select
                  id="post-sort"
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
              <strong>게시글 목록을 불러오지 못했습니다.</strong>
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
              <strong>조건에 맞는 게시글이 없습니다.</strong>
              <p>태그를 바꾸거나 정렬 조건을 변경해 보세요.</p>
            </div>
          ) : (
            <div className={styles.postGrid}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  variant="default"
                  title={post.title}
                  excerpt={post.content}
                  author={post.userId}
                  tags={post.tags}
                  viewCount={post.viewCount}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  imageUrl={post.imageUrl}
                  publishedAt={post.publishedAt}
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default PostSearchPage;
