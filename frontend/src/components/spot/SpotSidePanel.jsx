/**
 * @file SpotSidePanel.jsx
 * @description 루트 페이지 좌측 패널
 * 탭 1 - 루트: 내 루트 / 북마크한 루트 목록 + 스팟 목록 (+추가 버튼)
 * 탭 2 - 지도 검색: Google Places 검색 → 결과에서 +추가
 */
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import styles from '@/styles/SpotSidePanel.module.css';

const ROUTE_MENU_ITEMS = [
  { key: 'edit', label: '수정' },
  { key: 'delete', label: '삭제' },
  { key: 'rename', label: '루트이름변경' },
];

export default function SpotSidePanel({
  myRoutes = [],
  bookmarkedRoutes = [],
  visibleSpots = [],
  activeRouteKey = '',
  sidebarError = '',
  sidebarIssues = [],
  onSelectRoute,
  onRouteAction,
  onAddToRoute,
  onPreview,
  center,
}) {
  const [activeTab, setActiveTab] = useState('route');
  const [openMenuKey, setOpenMenuKey] = useState('');

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const placesLib = useMapsLibrary('places');
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const routeSections = useMemo(
    () => [
      { key: 'my-route', title: '내 루트', emptyMessage: '저장한 루트가 없습니다.', routes: myRoutes },
      { key: 'bookmarked-route', title: '북마크한 루트', emptyMessage: '북마크한 루트가 없습니다.', routes: bookmarkedRoutes },
    ],
    [myRoutes, bookmarkedRoutes],
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuKey('');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSearch = useCallback(() => {
    if (!placesLib || !keyword.trim()) return;
    setIsSearching(true);

    const svc = new google.maps.places.PlacesService(document.createElement('div'));
    const loc = center ? { lat: center.lat, lng: center.lng } : { lat: 35.6812, lng: 139.7671 };

    svc.textSearch({ query: keyword, location: loc, radius: '10000' }, (res, status) => {
      setIsSearching(false);
      setSearchResults(status === 'OK' && res?.length > 0 ? res.slice(0, 8) : []);
    });

    // TODO: 자체 DB 검색으로 교체 → GET /api/v1/spots/search?keyword=&mediaType=
  }, [placesLib, keyword, center]);

  const handleSelectSearchResult = useCallback(
    (item) => {
      const loc = { lat: item.geometry.location.lat(), lng: item.geometry.location.lng() };
      onPreview?.(loc);
      onAddToRoute?.({
        id: `place-${item.place_id}`,
        title: item.name,
        workName: item.formatted_address?.substring(0, 28) ?? '',
        color: '#374151',
        position: loc,
        placeId: item.place_id,
      });
    },
    [onPreview, onAddToRoute],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'route' ? styles.tabActive : ''}`} onClick={() => setActiveTab('route')}>
          루트
        </button>
        <button className={`${styles.tab} ${activeTab === 'search' ? styles.tabActive : ''}`} onClick={() => setActiveTab('search')}>
          지도 검색
        </button>
      </div>

      {activeTab === 'route' && (
        <div className={styles.bookmarkContent}>
          <div className={styles.folderList}>
            {sidebarError ? <p className={styles.routeError}>{sidebarError}</p> : null}
            {sidebarIssues.map((issue, index) => (
              <p key={`${issue}-${index}`} className={styles.routeIssue}>
                {issue}
              </p>
            ))}

            {routeSections.map((section) => (
              <div key={section.key} className={styles.routeSection}>
                <p className={styles.routeSectionTitle}>{section.title}</p>
                {section.routes.length === 0 ? <p className={styles.routeEmpty}>{section.emptyMessage}</p> : null}
                {section.routes.map((route) => (
                  <div key={route.key} className={styles.folderRow} ref={openMenuKey === route.key ? menuRef : null}>
                    <button
                      className={`${styles.folderItem} ${activeRouteKey === route.key ? styles.folderActive : ''}`}
                      onClick={() => onSelectRoute?.(route)}>
                      <span className={styles.folderIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                      </span>
                      <span className={styles.folderName}>{route.title}</span>
                      <span className={styles.folderCount}>{route.count}개</span>
                    </button>
                    <button
                      className={styles.menuTrigger}
                      type="button"
                      aria-label="루트 메뉴"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenMenuKey((prev) => (prev === route.key ? '' : route.key));
                      }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </button>
                    {openMenuKey === route.key ? (
                      <div className={styles.menuPanel}>
                        {ROUTE_MENU_ITEMS.map((item) => (
                          <button
                            key={item.key}
                            className={styles.menuItem}
                            type="button"
                            onClick={() => {
                              setOpenMenuKey('');
                              onRouteAction?.(item.key, route);
                            }}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.spotList}>
            {visibleSpots.map((spot) => (
              <div key={spot.id} className={styles.spotItem} onMouseEnter={() => onPreview?.(spot.position)}>
                <div className={styles.thumb} style={{ background: spot.color }} />
                <div className={styles.spotInfo}>
                  <span className={styles.spotTitle}>{spot.name || spot.title}</span>
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
