/**
 * @file MapSearchBar.jsx
 * @description MapPage 전용 검색창 (우리 DB + TMDB 데이터 검색용)
 *
 * - 2글자 이상 입력 시 검색 결과 드롭다운 표시
 * - 드롭다운 항목 Hover 시 미리보기(지도 중심 이동) 콜백
 * - 항목 클릭 시 결과 선택 및 우측 패널/태그 연동 콜백
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '@/styles/MapSearchBar.module.css'; // 기존 스타일 파일 공유 가능

export default function MapSearchBar({ data = [], onSelectResult, onPreview, placeholder = '작품명 또는 장소명 검색...', className = '' }) {
  const [keyword, setKeyword] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // 💡 2글자 이상 입력 시 전달받은 data에서 이름이나 제목으로 필터링
  const filteredData =
    keyword.length >= 2
      ? data.filter((item) => {
          const titleMatch = item.title && item.title.toLowerCase().includes(keyword.toLowerCase());
          const nameMatch = item.name && item.name.toLowerCase().includes(keyword.toLowerCase());
          return titleMatch || nameMatch;
        })
      : [];

  // 검색창 바깥 영역 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 장소/작품 선택 핸들러
  const selectItem = useCallback(
    (item) => {
      setKeyword(item.name || item.title); // 검색창 텍스트 업데이트
      setIsOpen(false);
      setActiveIdx(-1);
      onSelectResult?.(item); // MapPage로 선택된 데이터 객체 통째로 넘김
    },
    [onSelectResult],
  );

  // 키보드 네비게이션 (위/아래 방향키 및 엔터)
  const handleKeyDown = (e) => {
    if (!isOpen || filteredData.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filteredData.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        selectItem(filteredData[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`} ref={wrapperRef}>
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
            setIsOpen(true);
            setActiveIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (keyword.length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {keyword && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              setKeyword('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="검색어 지우기">
            ×
          </button>
        )}
      </div>

      {/* 2글자 이상 입력했을 때만 드롭다운 렌더링 */}
      {isOpen && keyword.length >= 2 && (
        <ul className={styles.dropdown}>
          {filteredData.length > 0 ? (
            filteredData.map((item, i) => (
              <li
                key={item.id || i}
                className={`${styles.dropdownItem} ${i === activeIdx ? styles.active : ''}`}
                onClick={() => selectItem(item)}
                onMouseEnter={() => {
                  setActiveIdx(i);
                  // 리스트 항목에 마우스를 올리면 위치 미리보기
                  if (item.position && onPreview) {
                    onPreview({ lat: item.position.lat, lng: item.position.lng });
                  }
                }}>
                <span className={styles.placeName}>{item.name || item.title}</span>
                <span className={styles.placeAddr}>{item.address || (item.mediaType ? `${item.mediaType} 작품` : '태그 정보')}</span>
              </li>
            ))
          ) : (
            <li className={styles.dropdownEmpty}>검색 결과가 없습니다.</li>
          )}
        </ul>
      )}
    </div>
  );
}
