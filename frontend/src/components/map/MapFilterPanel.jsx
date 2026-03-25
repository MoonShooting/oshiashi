import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '@/styles/MapFilterPanel.module.css';
import { searchMapArtworks, importArtwork } from '@/api/mapApi';
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

  // 1단계 단일 검색 로직 (백엔드 통합 API 호출)
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
        const data = await searchMapArtworks(query);
        let results = Array.isArray(data) ? data : [];

        // 새 명세에 따르면 mediaType이 '영화', '드라마' 등으로 오므로 그대로 필터링
        if (currentFilters.length > 0) {
          results = results.filter((item) => currentFilters.includes(item.mediaType));
        }

        setSuggestions(results);
        setIsOpen(true);
        setActiveIdx(-1);
      } catch (err) {
        console.error('[MapFilterPanel] 자동완성 로드 실패:', err);
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setWorkKeyword(val);

    // 한글 조합 중이어도 디바운스 검색은 실행되도록
    if (!isComposing.current) {
      scheduleAutocomplete(val, activeMediaTypes);
    }
  };

  // 작품 선택 시 처리
  const handleSelectItem = async (candidate) => {
    if (!candidate) return;

    const title = candidate.title;

    try {
      // 검색된 항목을 선택하면, 확실하게 우리 DB에 있도록 import API를 호출합니다.
      // (이미 DB에 있는 항목이면 백엔드에서 알아서 처리 후 반환해준다고 가정)
      const saved = await importArtwork({
        title: candidate.title,
        overview: candidate.overview,
        posterPath: candidate.posterPath,
        mediaType: candidate.mediaType,
        genreIds: candidate.genreIds,
      });

      const finalTitle = saved?.title || title;
      setWorkKeyword(finalTitle);
      onWorkSearch?.(finalTitle);
    } catch (err) {
      console.error('[MapFilterPanel] 작품 연동 실패:', err);
      // 저장(import) 실패 시에도 일단 지도 검색은 진행해 봅니다.
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
      if (isOpen && activeIdx >= 0 && suggestions[activeIdx]) {
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
                    isComposing.current = true;
                  }}
                  onCompositionEnd={(e) => {
                    isComposing.current = false;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="작품명 검색 (예: 너의 이름은)"
                  autoComplete="off"
                />
              </div>

              {isOpen && suggestions.length > 0 && (
                <ul className={styles.autocompleteList}>
                  {suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className={`${styles.autocompleteItem} ${idx === activeIdx ? styles.active : ''}`}
                      onClick={() => handleSelectItem(item)}>
                      <span>{item.title}</span>
                      {/* 미디어 타입 표시 (영화, 드라마 등) */}
                      <span style={{ fontSize: '11px', color: '#888', marginLeft: '6px' }}>[{item.mediaType || '작품'}]</span>
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
