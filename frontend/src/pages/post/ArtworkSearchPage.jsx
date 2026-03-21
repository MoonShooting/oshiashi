import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import SearchInputPanel from '@/components/search/SearchInputPanel';
import ArtworkCard from '@/components/post/ArtworkCard';
import { searchExternalArtworks } from '@/api/artworkApi';
import styles from '@/styles/ArtworkSearchPage.module.css';

const ArtworkSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const selectedType = searchParams.get('type') ?? '';
  const submittedQuery = searchParams.get('q') ?? '';

  // TMDB 검색은 "작품을 찾아 게시글 태그 검색으로 연결"하는 이 페이지에서만 유지합니다.
  // 작성/조회 페이지는 이번 작업의 목적이 태그 UI 정리이므로 TMDB 직접 조회를 넣지 않습니다.
  const artworkTypes = useMemo(
    () => [
      { artworkTypeId: 'movie', artworkTypeName: '영화' },
      { artworkTypeId: 'tv', artworkTypeName: '드라마' },
    ],
    [],
  );

  useEffect(() => {
    setInputValue(submittedQuery);
  }, [submittedQuery]);

  useEffect(() => {
    let alive = true;

    const loadArtworks = async () => {
      if (!submittedQuery.trim()) {
        setArtworks([]);
        setLoadError('');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError('');

      try {
        // 검색 결과는 TMDB 응답 원본을 그대로 쓰지 않고,
        // 카드 렌더링에 필요한 형태로 정규화된 searchExternalArtworks 결과만 사용합니다.
        const response = await searchExternalArtworks({
          query: submittedQuery,
          mediaType: selectedType || 'all',
        });

        if (!alive) return;
        setArtworks(response);
      } catch (error) {
        if (!alive) return;

        setArtworks([]);
        setLoadError(error.message || '작품 검색 결과를 불러오지 못했습니다.');
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    };

    loadArtworks();

    return () => {
      alive = false;
    };
  }, [selectedType, submittedQuery]);

  const handleSelectType = (typeId) => {
    const next = new URLSearchParams(searchParams);

    if (typeId) {
      next.set('type', typeId);
    } else {
      next.delete('type');
    }

    setSearchParams(next);
  };

  const handleSearch = (query) => {
    const next = new URLSearchParams(searchParams);
    const normalizedQuery = query.trim();

    if (normalizedQuery) {
      next.set('q', normalizedQuery);
    } else {
      next.delete('q');
    }

    setSearchParams(next);
  };

  const handleArtworkClick = (title) => {
    // 작품 선택의 목적은 import가 아니라 "작품명 태그로 게시글 탐색"이므로
    // /posts?tags=작품명 형태로 이동시켜 조회 페이지와 자연스럽게 연결합니다.
    const next = new URLSearchParams();
    next.set('tags', title);
    navigate(`/posts?${next.toString()}`);
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="artwork">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <div className={styles.headerBlock}>
            <p className={styles.eyebrow}>작품 탐색</p>
            <h1>대표 컨텐츠로 게시글 찾기</h1>
            <p className={styles.description}>
              TMDB 검색 결과를 바로 보여주고, 작품 카드를 누르면 해당 작품명으로 게시글 태그 검색
              페이지로 이동합니다.
            </p>
          </div>

          <div className={styles.toolbar}>
            <SearchInputPanel
              inputId="artwork-search-input"
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSearch}
              placeholder="TMDB에서 작품명을 검색하세요"
              submitLabel="TMDB 검색"
              helperText="검색 결과에서 작품을 선택하면 해당 제목으로 게시글 태그 검색을 진행합니다."
              leadingIcon={Search}
              submitIcon={Search}
            />

            <div className={styles.filterBar}>
              <button
                type="button"
                className={!selectedType ? `${styles.filterChip} ${styles.active}` : styles.filterChip}
                onClick={() => handleSelectType('')}>
                전체
              </button>
              {artworkTypes.map((type) => (
                <button
                  key={type.artworkTypeId}
                  type="button"
                  className={type.artworkTypeId === selectedType ? `${styles.filterChip} ${styles.active}` : styles.filterChip}
                  onClick={() => handleSelectType(type.artworkTypeId)}>
                  {type.artworkTypeName}
                </button>
              ))}
            </div>
          </div>

          {!submittedQuery.trim() ? (
            <div className={styles.stateBlock}>
              작품명을 입력하고 TMDB 검색을 실행하면 영화/드라마 결과가 이 영역에 표시됩니다.
            </div>
          ) : loadError ? (
            <div className={styles.stateBlock}>{loadError}</div>
          ) : isLoading ? (
            <div className={styles.stateBlock}>TMDB에서 작품 정보를 불러오는 중입니다.</div>
          ) : artworks.length === 0 ? (
            <div className={styles.stateBlock}>검색 조건에 맞는 작품이 없습니다.</div>
          ) : (
            <div className={styles.grid}>
              {artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  title={artwork.title}
                  artworkTypeName={artwork.artworkTypeName}
                  description={artwork.description}
                  imageUrl={artwork.imageUrl}
                  onClick={() => handleArtworkClick(artwork.title)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default ArtworkSearchPage;
