import React, { useMemo, useState } from 'react';
import { Film, Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import styles from '@/styles/ArtworkSearchPage.module.css';

// MOCK: 백엔드 작품 목록 API가 아직 확정되지 않아 화면 검토용 컨텐츠 10개를 페이지 내부에 임시 배치합니다.
// 실제 연동 시에는 이 배열을 제거하고 API 응답으로 그대로 교체하면 됩니다.
const mockArtworks = [
  { id: 'artwork-1', title: '너의 이름은', artworkTypeId: 'animation', artworkTypeName: '애니메이션', description: '도쿄와 시골 마을을 오가며 이어지는 대표적인 성지순례 작품입니다.' },
  { id: 'artwork-2', title: '토라도라', artworkTypeId: 'animation', artworkTypeName: '애니메이션', description: '학교와 거리 배경을 중심으로 캐릭터 동선이 선명한 학원물 작품입니다.' },
  { id: 'artwork-3', title: '러브라이브!', artworkTypeId: 'animation', artworkTypeName: '애니메이션', description: '아키하바라, 칸다, 오다이바 등 장소성과 팬 루트가 분명한 작품입니다.' },
  { id: 'artwork-4', title: '슬램덩크', artworkTypeId: 'movie', artworkTypeName: '영화', description: '현장감 있는 배경과 이동 동선을 따라가기 좋은 대표 농구 작품입니다.' },
  { id: 'artwork-5', title: '날씨의 아이', artworkTypeId: 'movie', artworkTypeName: '영화', description: '도쿄의 상징적인 풍경과 날씨 연출을 중심으로 장면 탐색이 가능한 작품입니다.' },
  { id: 'artwork-6', title: '스즈메의 문단속', artworkTypeId: 'movie', artworkTypeName: '영화', description: '전국 단위 이동 루트를 따라가며 장소를 모아보기 좋은 작품입니다.' },
  { id: 'artwork-7', title: 'Blue Giant', artworkTypeId: 'music', artworkTypeName: '음악', description: '재즈 공연장과 도시 배경을 중심으로 음악 팬 게시글 탐색이 가능한 컨텐츠입니다.' },
  { id: 'artwork-8', title: '봇치 더 록!', artworkTypeId: 'music', artworkTypeName: '음악', description: '라이브하우스와 밴드 동선을 중심으로 게시글이 연결될 수 있는 작품입니다.' },
  { id: 'artwork-9', title: 'NANA', artworkTypeId: 'music', artworkTypeName: '음악', description: '도시 라이프와 음악 씬을 함께 탐색하기 좋은 컨텐츠입니다.' },
  { id: 'artwork-10', title: '케이온!', artworkTypeId: 'animation', artworkTypeName: '애니메이션', description: '학교, 공연, 거리 풍경이 조합되어 태그 기반 게시글과 연결하기 좋은 작품입니다.' },
];

const ArtworkSearchPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState('');

  /**
   * 화면 흐름
   * 1. 사용자는 사이드바 "작품 탐색" 메뉴를 통해 이 페이지에 진입합니다.
   * 2. 이 페이지는 작품 대표 이미지/유형/설명을 먼저 보여주는 진입 화면입니다.
   * 3. 사용자가 작품을 선택하면, 해당 작품과 연결된 검색 기준으로 검색 결과 페이지(/posts)로 이동합니다.
   * 4. 실제 작품 목록 데이터와 작품-태그 연결 규칙은 추후 백엔드 명세에 맞춰 연결합니다.
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

    return mockArtworks.filter((artwork) => {
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
    // 현재는 작품 클릭 후 이동 흐름만 기획 차원에서 남깁니다.
    // 실제 구현 시에는 선택한 작품의 대표 태그 또는 작품과 연결된 검색 조건을 받아 /posts로 연결하면 됩니다.
    navigate('/posts');
  };

  return (
    <MainLayout isMapPage={false} activeMenuKey="works">
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
              <button key={artwork.id} type="button" className={styles.card} onClick={handleArtworkClick}>
                <div className={styles.posterFallback}>
                  <Film className={styles.posterFallbackIcon} strokeWidth={1.8} />
                </div>

                <div className={styles.cardBody}>
                  <span className={styles.typeBadge}>{artwork.artworkTypeName}</span>
                  <h2>{artwork.title}</h2>
                  <p>{artwork.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default ArtworkSearchPage;
