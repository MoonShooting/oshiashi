import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '@/styles/MapFilterPanel.module.css';
// 변경된 API 임포트
import { searchInternalArtwork, searchExternalArtwork, importArtwork } from '@/api/mapApi';
import { PIN_COLOR } from '@/constants/mapConstants';

export default function MapFilterPanel({ activeMediaTypes = [], onToggleMediaType, onWorkSearch }) {
  const [collapsed, setCollapsed] = useState(false);
  const [workKeyword, setWorkKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const isComposing = useRef(false);

  const FIXED_MEDIA_TYPES = ['영화', '드라마', '애니메이션'];

  // 자동완성 로직: 내부 DB 검색 -> 결과 없으면 외부 TMDB 검색
  const scheduleAutocomplete = useCallback((val, currentFilters = []) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = val?.trim();
    if (!query) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        // 내부 DB 먼저 검색
        const internalData = await searchInternalArtwork(query);
        let internalResults = Array.isArray(internalData) ? internalData : [];

        // 선택된 태그가 있다면 내부 검색 결과 필터링
        if (currentFilters.length > 0) {
          internalResults = internalResults.filter(
            (item) => currentFilters.includes(item.artworkTypeName), // 내부 DB는 artworkTypeName 기준
          );
        }

        if (internalResults.length > 0) {
          setSuggestions(internalResults.map((item) => ({ ...item, isExternal: false })));
          setIsOpen(true);
          setActiveIdx(-1);
          return;
        }

        // 내부 결과가 없으면 외부 TMDB 검색
        const externalData = await searchExternalArtwork(query);
        let externalResults = Array.isArray(externalData) ? externalData : [];

        //선택된 태그가 있다면 외부 검색 결과 필터링
        if (currentFilters.length > 0) {
          externalResults = externalResults.filter((item) => {
            const type = item.mediaType?.toLowerCase();
            // TMDB는 영문(movie, tv 등)으로 올 수 있으므로 한글 태그와 매핑하여 필터링
            const matchMovie = currentFilters.includes('영화') && type === 'movie';
            const matchDrama = currentFilters.includes('드라마') && type === 'tv';
            const matchAnimation = currentFilters.includes('애니메이션') && type === 'animation';

            return currentFilters.includes(item.mediaType) || matchMovie || matchDrama || matchAnimation;
          });
        }

        setSuggestions(externalResults.map((item) => ({ ...item, isExternal: true })));
        setIsOpen(true);
        setActiveIdx(-1);
      } catch (err) {
        console.error('[MapFilterPanel] 자동완성 로드 실패:', err);
        setSuggestions([]);
      }
    }, 200);
  }, []);

  // 한글 입력 중에도 부드럽게 검색되도록 핸들러 개선, 현재 활성화된 태그(activeMediaTypes)를 넘겨줌
  const handleInputChange = (e) => {
    const val = e.target.value;
    setWorkKeyword(val);
    scheduleAutocomplete(val, activeMediaTypes);
  };

  // 작품 선택 시 (isExternal 여부에 따라 Import API 연동)
  const handleSelectItem = async (candidate) => {
    if (!candidate) return;

    const title = candidate.title;

    try {
      if (candidate.isExternal) {
        // TMDB 외부 데이터인 경우 -> 먼저 DB에 Import
        const saved = await importArtwork({
          title: candidate.title,
          posterPath: candidate.posterPath,
          overview: candidate.overview,
          mediaType: candidate.mediaType,
          genreIds: candidate.genreIds,
        });

        // 백엔드에서 반환한 최신 타이틀 혹은 원래 타이틀 사용
        const finalTitle = saved?.title || title;
        setWorkKeyword(finalTitle);
        onWorkSearch?.(finalTitle);
      } else {
        // 내부 DB 검색 결과인 경우 -> 바로 검색
        setWorkKeyword(title);
        onWorkSearch?.(title);
      }
    } catch (err) {
      console.error('[MapFilterPanel] 작품 연동 실패:', err);
      // 저장 실패해도 일단 해당 이름으로 검색은 시도해봄
      setWorkKeyword(title);
      onWorkSearch?.(title);
    } finally {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (isComposing.current) return;

    if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (isOpen && activeIdx >= 0) {
        handleSelectItem(suggestions[activeIdx]);
      } else if (workKeyword.trim()) {
        onWorkSearch?.(workKeyword.trim());
        setIsOpen(false);
      }
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={`${styles.panel} ${isOpen && suggestions.length > 0 ? styles.overflowVisible : ''}`} ref={wrapperRef}>
      <div className={styles.header}>
        <span className={styles.title}>필터</span>
        <button type="button" className={styles.toggleBtn} onClick={() => setCollapsed(!collapsed)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={collapsed ? '6 9 12 15 18 9' : '18 15 12 9 6 15'} />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className={styles.body}>
          <div className={styles.section}>
            <label className={styles.sectionLabel}>작품</label>
            <div className={styles.workSearchWrapper}>
              <div className={styles.workSearchRow}>
                <input
                  className={styles.workInput}
                  value={workKeyword}
                  onChange={handleInputChange}
                  onCompositionStart={() => {
                    isComposing.current = true; // KeyDown에서 엔터 중복을 막기 위한 용도
                  }}
                  onCompositionEnd={() => {
                    isComposing.current = false; // KeyDown에서 엔터 중복을 막기 위한 용도
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="작품명 검색 (예: 너의 이름은)"
                  autoComplete="off"
                />
              </div>
              {/* 검색어가 있고, 결과가 있을 때만 자동완성 창 표시 */}
              {isOpen && suggestions.length > 0 && (
                <ul className={styles.autocompleteList}>
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className={`${styles.autocompleteItem} ${idx === activeIdx ? styles.active : ''}`}
                      onClick={() => handleSelectItem(item)}>
                      <span>{item.title}</span>
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '6px' }}>
                        {item.isExternal ? '[TMDB]' : `[${item.artworkTypeName || 'DB'}]`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.sectionLabel}>태그</label>
            <div className={styles.chipRow}>
              {FIXED_MEDIA_TYPES.map((type) => {
                const isActive = activeMediaTypes.includes(type);
                const config = PIN_COLOR[type] || PIN_COLOR.DEFAULT;

                return (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                    style={
                      isActive
                        ? {
                            backgroundColor: config.background,
                            borderColor: config.border,
                            color: config.glyph,
                          }
                        : {}
                    }
                    onClick={() => onToggleMediaType?.(type)}>
                    <span className={styles.chipIcon}>{config.icon}</span>
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
