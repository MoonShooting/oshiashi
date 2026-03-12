import React, { useMemo, useState } from 'react';
import { ChevronDown, Hash, RotateCcw, Search, SearchX, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import styles from '@/styles/PostSearchResultPage.module.css';

const normalizeKeyword = (value) => value.replace(/^#/, '').trim();

// MOCK: 검색 결과 페이지 검토용 게시글 10개입니다.
// 실제 연동 시에는 태그/정렬 조건을 포함한 백엔드 응답으로 교체하고, 이 배열은 제거합니다.
const mockPosts = [
  { id: 'post-1', title: '도쿄 배경으로 따라간 너의 이름은 루트 정리', content: '도쿄 시내 장면을 중심으로 걸어본 동선과 촬영 포인트를 정리한 게시글입니다.', userId: 'mitsuha_fan', viewCount: 2310, likeCount: 540, commentCount: 31, tags: ['도쿄', '너의이름은', '성지순례'] },
  { id: 'post-2', title: '아카바네에서 찾은 토라도라 분위기', content: '토라도라 배경으로 자주 언급되는 골목과 역 주변을 정리했습니다.', userId: 'taiga_route', viewCount: 1890, likeCount: 422, commentCount: 18, tags: ['아카바네', '토라도라', '학원물'] },
  { id: 'post-3', title: '도쿄 야경 위주로 본 날씨의 아이 스팟', content: '날씨의 아이 장면과 겹쳐 보이는 야경 포인트만 골라서 정리한 결과입니다.', userId: 'sunshine_runner', viewCount: 1605, likeCount: 311, commentCount: 14, tags: ['도쿄', '날씨의아이', '야경'] },
  { id: 'post-4', title: '러브라이브 성지 초보용 아키하바라 동선', content: '반나절 기준으로 이동 가능한 초심자용 루트를 정리했습니다.', userId: 'idol_trip', viewCount: 2742, likeCount: 630, commentCount: 42, tags: ['아키하바라', '러브라이브', '도쿄'] },
  { id: 'post-5', title: '너의 이름은 카페 배경과 실제 장소 비교', content: '작중 장면과 실제 장소 사진을 비교하면서 정리한 게시글입니다.', userId: 'kiminonawa_map', viewCount: 1450, likeCount: 298, commentCount: 11, tags: ['너의이름은', '도쿄', '카페'] },
  { id: 'post-6', title: '토라도라 감성으로 걷는 겨울 저녁 루트', content: '겨울 분위기를 살려볼 수 있는 도심 동선 위주로 추려봤습니다.', userId: 'winter_walk', viewCount: 1320, likeCount: 245, commentCount: 9, tags: ['토라도라', '도쿄', '야경'] },
  { id: 'post-7', title: '아카바네 근처 실내 위주 게시글 모음', content: '비 오는 날에도 보기 쉬운 실내 포인트를 중심으로 정리했습니다.', userId: 'rainy_trip', viewCount: 980, likeCount: 164, commentCount: 7, tags: ['아카바네', '도쿄', '실내'] },
  { id: 'post-8', title: '스즈메의 문단속 도쿄 구간 게시글 추천', content: '스즈메의 문단속 중 도쿄 장면을 기준으로 참고할 만한 포인트를 추렸습니다.', userId: 'door_keeper', viewCount: 1160, likeCount: 210, commentCount: 8, tags: ['스즈메의문단속', '도쿄', '영화'] },
  { id: 'post-9', title: '봇치 더 록 라이브하우스 태그 기반 게시글', content: '실제 공연장 느낌을 살릴 수 있는 포인트를 중심으로 기록했습니다.', userId: 'band_route', viewCount: 870, likeCount: 153, commentCount: 6, tags: ['봇치더록', '음악', '도쿄'] },
  { id: 'post-10', title: '케이온 풍경 태그로 묶어본 게시글 리스트', content: '학교, 거리, 공연 테마로 나눠 확인하기 쉽게 묶었습니다.', userId: 'tea_time', viewCount: 740, likeCount: 121, commentCount: 5, tags: ['케이온', '애니', '풍경'] },
];

const PostSearchResultPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('views');
  const [inputValue, setInputValue] = useState('');

  /**
   * 화면 흐름
   * 1. 사용자는 작품 탐색 페이지에서 작품을 선택하거나, tags query가 포함된 링크로 이 페이지에 진입합니다.
   * 2. 페이지는 현재 선택된 태그와 정렬값을 기준으로 어떤 결과를 보여줄지 표현합니다.
   * 3. 이후 백엔드가 태그 기준 게시글 목록을 내려주면, 이 페이지는 그 데이터를 그대로 카드 목록으로 렌더링합니다.
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
      ? mockPosts.filter((post) => selectedTags.every((tag) => post.tags.includes(tag)))
      : mockPosts;

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

          <div className={styles.controlRow}>
            <div className={styles.controlLeft}>
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
                <article key={post.id} className={styles.postCard}>
                  <div className={styles.cardImageWrap}>
                    <div className={styles.cardImageFallback} />
                  </div>

                  <div className={styles.cardBody}>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>

                    <div className={styles.cardTags}>
                      {post.tags.map((tag) => (
                        <span key={tag} className={styles.cardTag}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.cardAuthor}>
                        <span className={styles.cardAuthorAvatar} />
                        <span>{post.userId}</span>
                      </div>

                      <div className={styles.cardStats}>
                        <span className={styles.cardStat}>조회 {post.viewCount}</span>
                        <span className={styles.cardStat}>좋아요 {post.likeCount}</span>
                        <span className={styles.cardStat}>댓글 {post.commentCount}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default PostSearchResultPage;
