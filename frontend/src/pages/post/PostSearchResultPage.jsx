import React, { useMemo, useState } from 'react';
import { ChevronDown, Hash, RotateCcw, Search, SearchX, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostCard from '@/components/post/PostCard';
import { mockPostSummaries } from '@/components/post/postMockData';
import styles from '@/styles/PostSearchResultPage.module.css';

// 사용자가 "#도쿄", "도쿄", " 도쿄 "처럼 입력해도
// 내부 비교는 항상 같은 기준으로 처리되도록 정규화합니다.
const normalizeKeyword = (value) => value.replace(/^#/, '').trim();

const PostSearchResultPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('views');
  const [inputValue, setInputValue] = useState('');

  /**
   * 화면 흐름
   * 1. 사용자는 작품 탐색 페이지에서 작품을 선택하거나, tags query가 포함된 링크로 이 페이지에 진입합니다.
   * 2. 페이지는 현재 선택된 태그와 정렬값을 기준으로 어떤 결과를 보여줄지 표현합니다.
   * 3. 이후 백엔드가 태그 기준 게시글 목록을 내려주면, 이 페이지는 그 데이터를 카드 목록으로 렌더링합니다.
   * 4. 사용자는 여기서 태그 추가/제거, 정렬 변경, 게시글 상세 진입을 하게 됩니다.
   */
  const selectedTags = useMemo(() => {
    const raw = searchParams.get('tags') ?? '';
    return raw
      .split(',')
      .map((item) => normalizeKeyword(item))
      .filter(Boolean);
  }, [searchParams]);

  const filteredPosts = useMemo(() => {
    const results = selectedTags.length
      ? mockPostSummaries.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
      : mockPostSummaries;

    const sorted = [...results];

    if (sortBy === 'latest') return sorted.reverse();
    if (sortBy === 'popular') return sorted.sort((a, b) => b.likeCount - a.likeCount);
    return sorted.sort((a, b) => b.viewCount - a.viewCount);
  }, [selectedTags, sortBy]);

  const updateTags = (tags) => {
    // 검색 결과 페이지는 tags query를 기준으로 상태를 유지합니다.
    // 이후 백엔드 검색 API가 붙더라도, 이 query를 요청 파라미터의 기준값으로 사용하면 됩니다.
    const next = new URLSearchParams(searchParams);

    if (tags.length > 0) {
      next.set('tags', tags.join(','));
    } else {
      next.delete('tags');
    }

    setSearchParams(next);
  };

  const handleAddTag = () => {
    const nextTag = normalizeKeyword(inputValue);
    if (!nextTag || selectedTags.includes(nextTag)) return;

    updateTags([...selectedTags, nextTag]);
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
    <MainLayout isMapPage={false} activeMenuKey="community">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <header className={styles.searchHeader}>
            <h2>{title}</h2>
            <p>
              총 {filteredPosts.length}개의 게시글
              <span className={styles.headerHint}>현재는 화면 검토용 목업 데이터가 출력되고 있습니다.</span>
            </p>
          </header>

          {/* 검색 조건 분리 제안은 frontend/POST_SEARCH_CONTROLS_PROPOSAL.md 문서에 정리해 두고,
              현재 코드는 흐름 보존을 위해 페이지 안에 유지합니다. */}
          <div className={styles.controlRow}>
            <div className={styles.controlLeft}>
              {/* 태그 입력창은 현재 페이지 안에서 selectedTags 상태를 바꾸는 역할만 담당합니다. */}
              <div className={styles.tagSearchWrap}>
                <div className={styles.tagSearchInputWrap}>
                  <Hash className={styles.tagSearchIcon} strokeWidth={2} />
                  <input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className={styles.tagSearchInput}
                    placeholder="#도쿄, #토라도라, #아카바네"
                  />
                  <button type="button" className={styles.tagAddButton} onClick={handleAddTag}>
                    <Search className={styles.tagAddIcon} strokeWidth={2} />
                    <span>태그 추가</span>
                  </button>
                </div>
              </div>

              <div className={styles.filterBar}>
                {/* 선택된 태그를 chip 형태로 보여주고, 개별 제거 또는 전체 초기화를 제공합니다. */}
                <div className={styles.filterChipGroup}>
                  {selectedTags.map((tag) => (
                    <button key={tag} type="button" className={styles.filterChip} onClick={() => handleRemoveTag(tag)}>
                      <span>#{tag}</span>
                      <X className={styles.filterChipIcon} strokeWidth={2} />
                    </button>
                  ))}

                  {selectedTags.length > 0 ? (
                    <button type="button" className={styles.filterResetButton} onClick={handleReset}>
                      <RotateCcw className={styles.filterResetIcon} strokeWidth={2} />
                      <span>필터 초기화</span>
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className={styles.sortWrap}>
              <label htmlFor="post-sort">정렬</label>
              <div className={styles.sortField}>
                <select id="post-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={styles.sortSelect}>
                  <option value="latest">최신순</option>
                  <option value="popular">인기순</option>
                  <option value="views">조회순</option>
                </select>
                <ChevronDown className={styles.sortIcon} strokeWidth={2} />
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrap}>
                <SearchX className={styles.emptyIcon} strokeWidth={2} />
              </div>
              <strong>조건에 맞는 목업 게시글이 없습니다.</strong>
              <p>현재는 화면 검토용 목업 데이터만 들어가 있으며, 실제 연동 시 이 영역이 API 결과로 교체됩니다.</p>
            </div>
          ) : (
            <div className={styles.postGrid}>
              {filteredPosts.map((post) => (
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

export default PostSearchResultPage;
