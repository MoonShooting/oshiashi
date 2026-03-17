/**
 * @file SpotSidePanel.jsx
 * @description 루트(SpotPage) 좌측 패널
 *
 * 탭 1 - 북마크: 저장된 루트 폴더 목록 + 폴더 내 스팟 목록 ("+추가" 버튼)
 * 탭 2 - 지도 검색: Google Places 검색 → 결과에서 "+추가"
 *
 * @param {Array}    savedRoutes      - SpotPage에서 관리하는 저장 루트 폴더 목록 (저장 시 증가)
 * @param {Function} onAddToRoute(spot) - 루트에 장소 추가 콜백
 * @param {Function} onPreview(loc)     - 지도 카메라 이동 콜백
 * @param {{ lat, lng }} center         - 현재 지도 중심 (Places 검색 기준점)
 */

import React, { useState, useCallback, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import styles from '@/styles/SpotSidePanel.module.css';
import { DUMMY_BOOKMARKED_SPOTS } from '@/data/dummyData';

export default function SpotSidePanel({ savedRoutes = [], onAddToRoute, onPreview, center }) {
  const [activeTab, setActiveTab] = useState('bookmark');
  const [activeFolderId, setActiveFolderId] = useState(null);

  // 지도 검색 탭 상태
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const placesLib = useMapsLibrary('places');
  const inputRef = useRef(null);

  // 선택 폴더 기준으로 스팟 필터링 (없으면 전체)
  const visibleSpots = activeFolderId ? DUMMY_BOOKMARKED_SPOTS.filter((s) => s.folderId === activeFolderId) : DUMMY_BOOKMARKED_SPOTS;

  /*
   * TODO: 백엔드 연동 시 아래 주석 해제 (북마크 폴더 목록 로드)
   * useEffect(() => {
   *   fetch('/api/v1/routes/my', {
   *     headers: { Authorization: `Bearer ${token}` },
   *   })
   *     .then((r) => r.json())
   *     .then((data) =>
   *       setFolders(data.map((r) => ({ id: String(r.routeId), name: r.title, count: r.spots?.length ?? 0 })))
   *     );
   * }, []);
   *
   * TODO: 폴더 클릭 시 스팟 목록 로드
   * fetch(`/api/v1/routes/${folderId}`)
   *   .then((r) => r.json())
   *   .then((data) => setVisibleSpots(data.spots.map(normalizeSpot)));
   */

  // 지도 검색 실행
  const handleSearch = useCallback(() => {
    if (!placesLib || !keyword.trim()) return;
    setIsSearching(true);

    const svc = new google.maps.places.PlacesService(document.createElement('div'));
    const loc = center ? { lat: center.lat, lng: center.lng } : { lat: 35.6812, lng: 139.7671 };

    svc.textSearch({ query: keyword, location: loc, radius: '10000' }, (res, status) => {
      setIsSearching(false);
      if (status === 'OK' && res?.length > 0) {
        setSearchResults(res.slice(0, 8));
      } else {
        setSearchResults([]);
      }
    });

    // TODO: Google Places 대신 자체 DB + TMDB 검색으로 교체
    // GET /api/v1/spots/search?keyword=&mediaType=
  }, [placesLib, keyword, center]);

  // 검색 결과 → 루트에 추가 + 지도 이동
  const handleSelectSearchResult = useCallback(
    (item) => {
      const loc = {
        lat: item.geometry.location.lat(),
        lng: item.geometry.location.lng(),
      };
      onPreview?.(loc);
      onAddToRoute?.({
        id: `place-${item.place_id}`,
        title: item.name,
        workName: item.formatted_address?.substring(0, 28) ?? '',
        color: '#374151', // 검색 결과는 기본 placeholder 색
        position: loc,
        placeId: item.place_id,
      });
    },
    [onPreview, onAddToRoute],
  );

  return (
    <div className={styles.panel}>
      {/* 탭 헤더 */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'bookmark' ? styles.tabActive : ''}`} onClick={() => setActiveTab('bookmark')}>
          북마크
        </button>
        <button className={`${styles.tab} ${activeTab === 'search' ? styles.tabActive : ''}`} onClick={() => setActiveTab('search')}>
          지도 검색
        </button>
      </div>

      {/* 북마크 탭 */}
      {activeTab === 'bookmark' && (
        <div className={styles.bookmarkContent}>
          {/* 폴더(루트) 목록 */}
          <div className={styles.folderList}>
            {savedRoutes.map((folder) => (
              <button
                key={folder.id}
                className={`${styles.folderItem} ${activeFolderId === folder.id ? styles.folderActive : ''}`}
                onClick={() => setActiveFolderId((prev) => (prev === folder.id ? null : folder.id))}>
                <span className={styles.folderIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className={styles.folderName}>{folder.name}</span>
                <span className={styles.folderCount}>{folder.count}개</span>
              </button>
            ))}
          </div>

          {/* 스팟 목록 */}
          <div className={styles.spotList}>
            {visibleSpots.map((spot) => (
              <div key={spot.id} className={styles.spotItem} onMouseEnter={() => onPreview?.(spot.position)}>
                {/* 썸네일 — 이미지 없는 동안 placeholder 색상 박스 */}
                <div className={styles.thumb} style={{ background: spot.color }} />
                <div className={styles.spotInfo}>
                  <span className={styles.spotTitle}>{spot.title}</span>
                  <span className={styles.spotWork}>{spot.workName}</span>
                </div>
                <button className={styles.addBtn} onClick={() => onAddToRoute?.(spot)}>
                  + 추가
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 지도 검색 탭 */}
      {activeTab === 'search' && (
        <div className={styles.searchContent}>
          <div className={styles.searchRow}>
            <input
              ref={inputRef}
              className={styles.searchInput}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="장소, 랜드마크 검색..."
              autoComplete="off"
            />
            <button className={styles.searchBtn} onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                '…'
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              )}
            </button>
          </div>

          <div className={styles.searchResults}>
            {keyword && !isSearching && searchResults.length === 0 && <p className={styles.noResult}>검색 결과가 없습니다.</p>}
            {searchResults.map((item) => (
              <div key={item.place_id} className={styles.resultItem}>
                <div className={styles.resultInfo}>
                  <span className={styles.resultName}>{item.name}</span>
                  <span className={styles.resultAddr}>
                    {item.formatted_address?.substring(0, 28)}
                    {item.formatted_address?.length > 28 ? '...' : ''}
                  </span>
                </div>
                <button className={styles.addBtn} onClick={() => handleSelectSearchResult(item)}>
                  + 추가
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
