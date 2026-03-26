import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Hash, Search, SearchX } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/post/PostCard';
import SearchInputPanel from '@/components/search/SearchInputPanel';
import { ensureLocalArtworkTag, searchArtworkTagOptions } from '@/api/artworkTagApi';
import { fetchRoutePosts, routePostsUpdatedEvent } from '@/api/routePostApi';
import usePostListLoader from '@/pages/post/hooks/usePostListLoader';
import styles from '@/styles/PostSearchPage.module.css';

// 사용자가 "#도쿄", "도쿄", " 도쿄 "처럼 입력해도
// 내부 비교는 항상 같은 기준으로 처리되도록 정규화합니다.
const normalizeKeyword = (value) => value.replace(/^#/, '').trim();
const resolveCandidateLabel = (candidate) => normalizeKeyword(candidate?.tagName ?? candidate?.title ?? candidate?.label ?? '');

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
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [isSearchingTags, setIsSearchingTags] = useState(false);
  const [tagSearchError, setTagSearchError] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  const tagSearchDebounceRef = useRef(null);
  const isComposing = useRef(false);
  const panelRef = useRef(null);

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

  useEffect(() => {
    const closeSuggestionsOnOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsSuggestionOpen(false);
      }
    };

    document.addEventListener('mousedown', closeSuggestionsOnOutside);
    return () => document.removeEventListener('mousedown', closeSuggestionsOnOutside);
  }, []);

  useEffect(() => {
    const query = normalizeKeyword(inputValue);

    if (tagSearchDebounceRef.current) {
      clearTimeout(tagSearchDebounceRef.current);
    }

    if (!query) {
      setTagSuggestions([]);
      setIsSuggestionOpen(false);
      setTagSearchError('');
      setIsSearchingTags(false);
      return undefined;
    }

    if (isComposing.current) return undefined;

    tagSearchDebounceRef.current = setTimeout(async () => {
      // 입력 중에는 "검색을 실제로 실행"하기보다
      // 사용자가 선택할 수 있는 태그 후보를 계속 갱신합니다.
      // 실제 URL 검색 상태는 후보를 선택하거나 제출한 뒤에만 변경합니다.
      setIsSearchingTags(true);
      setTagSearchError('');

      try {
        const result = await searchArtworkTagOptions(query);
        setTagSuggestions((result.items ?? []).slice(0, 6));
        setIsSuggestionOpen((result.items ?? []).length > 0);
        setActiveSuggestionIndex(-1);
      } catch (error) {
        setTagSuggestions([]);
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(-1);
        setTagSearchError(error.message || '작품 태그 추천을 불러오지 못했습니다.');
      } finally {
        setIsSearchingTags(false);
      }
    }, 250);

    return () => {
      if (tagSearchDebounceRef.current) {
        clearTimeout(tagSearchDebounceRef.current);
      }
    };
  }, [inputValue]);

  const updateTags = useCallback((tags) => {
    // 조회 페이지는 TMDB를 직접 조회하지 않고 tags query만 상태의 기준으로 삼습니다.
    // 이렇게 두면 작품 탐색 페이지에서 넘어온 검색 조건을 URL만으로 복원할 수 있습니다.
    const next = new URLSearchParams(searchParams);

    if (tags.length > 0) {
      next.set('tags', tags.join(','));
    } else {
      next.delete('tags');
    }

    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const applyResolvedTag = useCallback(
    async (candidate) => {
      // 게시글 검색 페이지는 자유 문자열이 아니라
      // "실제 서비스에 존재하는 tagName"만 검색 조건으로 사용해야 합니다.
      // 그래서 후보를 선택하면 먼저 로컬 Tag 확정을 거친 뒤 URL을 갱신합니다.
      const resolved = await ensureLocalArtworkTag(candidate);
      const normalizedTag = normalizeKeyword(resolved?.tagName ?? candidate?.tagName ?? candidate?.title ?? '');
      if (!normalizedTag) {
        throw new Error('검색에 사용할 작품 태그를 확인하지 못했습니다.');
      }

      updateTags(Array.from(new Set([...selectedTags, normalizedTag])));
      setInputValue('');
      setTagSuggestions([]);
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(-1);
      setTagSearchError('');
    },
    [selectedTags, updateTags],
  );

  const handleTagInputKeyDown = useCallback(
    async (event) => {
      if (isComposing.current) return;

      if (event.key === 'ArrowDown' && isSuggestionOpen) {
        event.preventDefault();
        setActiveSuggestionIndex((prev) => Math.min(prev + 1, tagSuggestions.length - 1));
        return;
      }

      if (event.key === 'ArrowUp' && isSuggestionOpen) {
        event.preventDefault();
        setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
        return;
      }

      if (event.key === 'Enter' && isSuggestionOpen && activeSuggestionIndex >= 0 && tagSuggestions[activeSuggestionIndex]) {
        event.preventDefault();
        try {
          await applyResolvedTag(tagSuggestions[activeSuggestionIndex]);
        } catch (error) {
          setTagSearchError(error.message || '작품 태그를 추가하지 못했습니다.');
        }
      }
    },
    [activeSuggestionIndex, applyResolvedTag, isSuggestionOpen, tagSuggestions],
  );

  const handleAddTag = useCallback(async () => {
    const query = normalizeKeyword(inputValue);
    if (!query) return;

    // 제출 버튼 Enter/클릭은 "현재 입력을 바로 태그로 쓸 수 있는가?"를 확인하는 단계입니다.
    // 정확히 하나로 확정되면 즉시 적용하고,
    // 여러 후보가 있으면 사용자가 목록에서 정확한 작품을 고르게 합니다.
    setIsSearchingTags(true);
    setTagSearchError('');

    try {
      const result = await searchArtworkTagOptions(query);
      const candidates = result.items ?? [];
      const exact = candidates.find((candidate) => resolveCandidateLabel(candidate).toLowerCase() === query.toLowerCase());

      // 게시물 검색에서는 TMDB 후보를 개수 1개라는 이유만으로 자동 확정하지 않는다.
      // 외부 작품은 사용자가 추천 목록에서 실제로 보고 선택해야
      // "원하는 작품이 맞는지"를 확인할 수 있고, 의도치 않은 import도 줄일 수 있다.
      const matched = result.source === 'LOCAL_DB' ? exact ?? (candidates.length === 1 ? candidates[0] : null) : null;

      if (!matched) {
        // 같은 제목/비슷한 제목의 작품이 여러 개인 상황에서는
        // 잘못된 tagName으로 검색해 버리지 않도록 자동 선택을 피합니다.
        // 특히 TMDB 외부 후보는 1건만 내려와도 사용자가 목록에서 확정하도록 유도합니다.
        setTagSuggestions(candidates.slice(0, 6));
        setIsSuggestionOpen(candidates.length > 0);
        setActiveSuggestionIndex(-1);
        setTagSearchError(
          candidates.length > 0
            ? '여러 작품 후보가 있습니다. 아래 목록에서 정확한 태그를 선택해 주세요.'
            : '일치하는 작품 태그를 찾지 못했습니다.',
        );
        return;
      }

      await applyResolvedTag(matched);
    } catch (error) {
      setTagSearchError(error.message || '작품 태그를 추가하지 못했습니다.');
    } finally {
      setIsSearchingTags(false);
    }
  }, [applyResolvedTag, inputValue]);

  const handleRemoveTag = (tag) => {
    updateTags(selectedTags.filter((item) => item !== tag));
  };

  const handleReset = () => {
    // 필터 초기화는 검색 결과 페이지를 "태그가 없는 기본 상태"로 되돌리는 역할입니다.
    updateTags([]);
    setInputValue('');
    setTagSuggestions([]);
    setIsSuggestionOpen(false);
    setTagSearchError('');
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
            <div className={styles.controlLeft} ref={panelRef}>
              <SearchInputPanel
                inputId="post-search-tag-input"
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleAddTag}
                placeholder="작품 태그를 검색하세요"
                helperText="로컬 태그를 우선 찾고, 없으면 외부 작품을 로컬 태그로 확정해 검색에 사용합니다."
                errorText={tagSearchError}
                submitLabel={isSearchingTags ? '찾는 중...' : '태그 추가'}
                selectedItems={selectedTags}
                onRemoveItem={handleRemoveTag}
                onReset={selectedTags.length > 0 ? handleReset : undefined}
                leadingIcon={Hash}
                submitIcon={Search}
                disabled={isSearchingTags}
                suggestionItems={isSuggestionOpen ? tagSuggestions : []}
                // 추천 목록도 같은 공통 확정 로직을 타게 해서
                // 버튼 제출과 추천 클릭이 같은 결과를 내도록 맞춥니다.
                onSelectSuggestion={applyResolvedTag}
                formatSuggestionLabel={(item) => resolveCandidateLabel(item)}
                getSuggestionMeta={(item) =>
                  item?.mediaType ? `[${item.mediaType}]` : item?.source === 'TMDB' ? '외부 후보' : '로컬 태그'
                }
                onInputKeyDown={handleTagInputKeyDown}
                suggestionActiveIndex={activeSuggestionIndex}
                onInputCompositionStart={() => {
                  isComposing.current = true;
                }}
                onInputCompositionEnd={(event) => {
                  isComposing.current = false;
                  setInputValue(event.target.value);
                }}
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
                  tagNames={post.tagNames}
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
