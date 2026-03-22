/**
 * @file MapSearchBar.jsx
 * @description 지도 위에 올라가는 검색창 컴포넌트
 *
 * - Google Places API textSearch 사용 (작품명·장소 검색)
 * - 검색 결과 드롭다운 → hover 시 지도 미리보기 이동
 * - 검색 결과 클릭 → 지도 중심 이동 + 콜백
 * - MapPage / SpotPage 모두 사용
 */

import React, { useState, useCallback, useRef } from 'react';
import { useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import styles from '@/styles/SpotSearchBar.module.css';

/**
 * @param {Function} onSelectPlace  - 장소 선택 시 콜백 ({ lat, lng, name, placeId? })
 * @param {Function} onPreview      - 드롭다운 hover 시 미리보기 콜백 ({ lat, lng })
 * @param {string}   placeholder    - 검색창 placeholder
 * @param {string}   className      - 외부에서 위치 조절용 className
 * @param {{ lat: number, lng: number }} center
 *   - <Map> 바깥에서 사용 시 현재 지도 중심 좌표를 prop으로 전달하세요.
 *     useMap()이 null을 반환할 때 이 값이 검색 location 기준으로 쓰입니다.
 *     <Map> 안에서 사용하면 useMap()이 우선 적용되므로 생략 가능합니다.
 */
export default function SpotSearchBar({ onSelectPlace, onPreview, placeholder = '작품명 검색...', className = '', center }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1); // 키보드 탐색용
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  const inputRef = useRef(null);

  // 검색 실행
  const handleSearch = useCallback(() => {
    const term = searchKeyword || keyword;
    if (!placesLib || !term.trim()) return;

    const svc = new google.maps.places.PlacesService(document.createElement('div'));

    // 맵 객체가 존재하면 맵의 "현재 실제 중심"을 실시간으로 가져옴.
    // 이렇게 하면 드래그 후에도 갱신된 위치가 기준이 됨.
    const searchLocation = map ? map.getCenter() : { lat: 35.6812, lng: 139.7671 };

    // 30km 반경(30000)을 설정하여 해당 위치 우선 검색
    const request = {
      query: term,
      location: searchLocation,
      radius: 30000,
    };

    svc.textSearch(request, (res, status) => {
      if (status === 'OK' && res?.length > 0) {
        setResults(res);
        setIsOpen(true);
        setActiveIdx(-1);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    });
  }, [placesLib, keyword, map]);

  // 장소 선택
  const selectPlace = useCallback(
    (item) => {
      const loc = {
        lat: item.geometry.location.lat(),
        lng: item.geometry.location.lng(),
        name: item.name,
        address: item.formatted_address,
        placeId: item.place_id,
      };
      onSelectPlace?.(loc);
      setKeyword(item.name);
      setResults([]);
      setIsOpen(false);
    },
    [onSelectPlace],
  );

  // 드롭다운 hover → 지도 미리보기
  const handleHover = useCallback(
    (item) => {
      onPreview?.({
        lat: item.geometry.location.lat(),
        lng: item.geometry.location.lng(),
      });
    },
    [onPreview],
  );

  // 키보드 탐색 (↑↓ Enter Escape)
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') handleSearch();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      selectPlace(results[activeIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setResults([]);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* 검색 입력창 */}
      <div className={styles.inputRow}>
        <span className={styles.searchIcon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (!e.target.value) {
              setResults([]);
              setIsOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
        {keyword && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setKeyword('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="검색어 지우기">
            ×
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <ul className={styles.dropdown}>
          {results.map((item, i) => (
            <li
              key={item.place_id || i}
              className={`${styles.dropdownItem} ${i === activeIdx ? styles.active : ''}`}
              onClick={() => selectPlace(item)}
              onMouseEnter={() => {
                setActiveIdx(i);
                handleHover(item);
              }}>
              <span className={styles.placeName}>{item.name}</span>
              <span className={styles.placeAddr}>
                {item.formatted_address?.substring(0, 28)}
                {item.formatted_address?.length > 28 ? '...' : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
