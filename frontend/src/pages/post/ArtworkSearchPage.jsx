import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import SearchInputPanel from '@/components/search/SearchInputPanel';
import ArtworkCard from '@/components/post/ArtworkCard';
import { resolveArtworkSelectionToTag } from '@/api/artworkTagApi';
import { searchArtworkCandidates } from '@/api/artworkApi';
import { navigateToPostTagSearch } from '@/utils/postTagSearch';
import styles from '@/styles/ArtworkSearchPage.module.css';

const ArtworkSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResolvingArtwork, setIsResolvingArtwork] = useState(false);
  const [loadError, setLoadError] = useState('');

  const selectedType = searchParams.get('type') ?? '';
  const submittedQuery = searchParams.get('q') ?? '';

  // 작품 탐색은 "서비스 내부 Artwork/Tag를 우선"으로 맞춘다.
  // 로컬 검색 결과가 있으면 그것을 먼저 보여주고, 없을 때만 외부 후보를 노출한다.
  const artworkTypes = useMemo(
    () => [
      { artworkTypeId: 'animation', artworkTypeName: '애니메이션' },
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
        const response = await searchArtworkCandidates({
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

  const handleArtworkClick = async (artwork) => {
    setIsResolvingArtwork(true);
    setLoadError('');

    try {
      // 작품 탐색 페이지의 클릭은 단순 상세 이동이 아니라
      // "이 작품을 게시글 검색 조건으로 채택한다"는 의미입니다.
      // 따라서 먼저 로컬 Tag를 보장한 뒤에만 게시글 검색으로 이동합니다.
      const resolvedTag = await resolveArtworkSelectionToTag(artwork);
      const tagName = String(resolvedTag?.tagName ?? artwork?.title ?? '').trim();
      if (!tagName) {
        throw new Error('게시글 검색에 사용할 작품 태그를 확인하지 못했습니다.');
      }
      navigateToPostTagSearch(navigate, tagName);
    } catch (error) {
      setLoadError(error.message || '작품을 서비스 태그로 확정하지 못했습니다.');
    } finally {
      setIsResolvingArtwork(false);
    }
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="artwork">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <div className={styles.headerBlock}>
            <p className={styles.eyebrow}>작품 탐색</p>
            <h1>대표 컨텐츠로 게시글 찾기</h1>
            <p className={styles.description}>
              서비스에 등록된 작품을 우선 보여주고, 없으면 외부 후보를 제안합니다. 작품을 선택하면
              필요한 경우 Artwork와 Tag를 먼저 확정한 뒤 게시글 검색으로 이동합니다.
            </p>
          </div>

          <div className={styles.toolbar}>
            <SearchInputPanel
              inputId="artwork-search-input"
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSearch}
              // 이 페이지는 태그 직접 입력이 아니라 "작품 카드 탐색"이 목적이므로
              // 추천 드롭다운 대신 검색어 제출 -> 결과 카드 표시 구조를 유지합니다.
              placeholder="작품명을 검색하세요"
              submitLabel="작품 검색"
              helperText="로컬 Artwork가 있으면 우선 노출하고, 없을 때만 외부 후보를 보여줍니다."
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
              작품명을 입력하면 먼저 서비스 내부 작품을 찾고, 없으면 외부 후보를 이 영역에 표시합니다.
            </div>
          ) : loadError ? (
            <div className={styles.stateBlock}>{loadError}</div>
          ) : isResolvingArtwork ? (
            <div className={styles.stateBlock}>선택한 작품을 서비스 태그로 확정하는 중입니다.</div>
          ) : isLoading ? (
            <div className={styles.stateBlock}>작품 정보를 불러오는 중입니다.</div>
          ) : artworks.length === 0 ? (
            <div className={styles.stateBlock}>검색 조건에 맞는 서비스 작품이나 외부 후보가 없습니다.</div>
          ) : (
            <div className={styles.grid}>
              {artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  title={artwork.title}
                  artworkTypeName={artwork.artworkTypeName}
                  description={artwork.description}
                  imageUrl={artwork.imageUrl}
                  // 카드 클릭 시점이 "작품 채택" 시점입니다.
                  // 즉, 여기서 단순 제목 전달이 아니라 작품 객체 전체를 넘겨
                  // 로컬/외부 여부에 따라 확정 로직을 다르게 수행합니다.
                  onClick={() => handleArtworkClick(artwork)}
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
