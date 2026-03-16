import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import ArtworkCard from '@/components/post/ArtworkCard';
import { MOCK_ARTWORKS } from '@/data/post/mockArtworks';
import styles from '@/styles/ArtworkSearchPage.module.css';

const ArtworkSearchPage = () => {
  // 작품 탐색 페이지는 검색 조건과 이동 흐름만 들고,
  // 카드 렌더링과 목업 데이터는 각각 component/data 계층으로 분리해 둡니다.
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState('');

  /**
   * 화면 흐름
   * 1. 사용자는 사이드바 "작품 탐색" 메뉴를 통해 이 페이지에 진입합니다.
   * 2. 이 페이지는 작품 대표 이미지/유형/설명을 먼저 보여주는 진입 화면입니다.
   * 3. 사용자가 작품을 선택하면, 해당 작품과 연결된 검색 기준으로 검색 결과 페이지(/posts)로 이동합니다.
   * 4. 현재는 화면 구조 검토 단계이므로, 작품 목록/유형/설명은 목업 데이터로만 표현합니다.
   */
  const selectedType = searchParams.get('type') ?? '';

  const artworkTypes = useMemo(
    () => [
      { artworkTypeId: 'animation', artworkTypeName: '애니메이션' },
      { artworkTypeId: 'movie', artworkTypeName: '영화' },
      { artworkTypeId: 'music', artworkTypeName: '음악' },
    ],
    [],
  );

  const filteredArtworks = useMemo(() => {
    const keyword = inputValue.trim().toLowerCase();

    return MOCK_ARTWORKS.filter((artwork) => {
      const matchesType = !selectedType || artwork.artworkTypeId === selectedType;
      const matchesKeyword =
        !keyword ||
        artwork.title.toLowerCase().includes(keyword) ||
        artwork.description.toLowerCase().includes(keyword) ||
        artwork.artworkTypeName.toLowerCase().includes(keyword);

      return matchesType && matchesKeyword;
    });
  }, [inputValue, selectedType]);

  const handleSelectType = (typeId) => {
    const next = new URLSearchParams(searchParams);

    if (typeId) {
      next.set('type', typeId);
    } else {
      next.delete('type');
    }

    setSearchParams(next);
  };

  const handleArtworkClick = () => {
    // 현재 브랜치에서는 작품 카드 클릭 시 "검색 결과 페이지로 이어지는 진입 흐름"만 확인합니다.
    // 아직 작품-태그 매핑 규칙이 확정되지 않았기 때문에, 상세 query 없이 /posts로만 이동합니다.
    navigate('/posts');
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="artwork">
      <section className={styles.pageShell}>
        <div className={styles.pageCard}>
          <div className={styles.headerBlock}>
            <p className={styles.eyebrow}>작품 탐색</p>
            <h1>대표 컨텐츠로 게시글 찾기</h1>
            <p className={styles.description}>
              작품 대표 이미지와 유형을 먼저 보여주고, 컨텐츠 선택 시 해당 작품과 연결된 태그로 검색 결과 페이지가 이어지도록 설계한 화면입니다.
            </p>
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <Search className={styles.searchIcon} strokeWidth={2} />
              <input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="작품명 또는 유형 검색"
              />
            </label>

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

          <div className={styles.grid}>
            {filteredArtworks.map((artwork) => (
              // 페이지는 "어떤 작품을 보여줄지"만 결정하고, 카드의 시각 구조는 ArtworkCard가 담당합니다.
              <ArtworkCard
                key={artwork.id}
                title={artwork.title}
                artworkTypeName={artwork.artworkTypeName}
                description={artwork.description}
                onClick={handleArtworkClick}
              />
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ArtworkSearchPage;
