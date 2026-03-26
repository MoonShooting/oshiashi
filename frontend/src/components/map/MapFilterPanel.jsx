import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '@/styles/MapFilterPanel.module.css';
import { searchMapArtworks } from '@/api/mapApi';
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

  const MEDIA_TYPE_KO = {
    MOVIE: '영화',
    TV: '드라마',
    ANIMATION: '애니메이션',
    ANIME: '애니메이션',
  };

  // /api/v1/maps/autocomplete?keyword= 호출 (debounce 유지)
  const scheduleAutocomplete = useCallback((val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = val?.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMapArtworks(query);
        const results = Array.isArray(data)
          ? data.map((s) =>
              typeof s === 'string'
                ? { title: s, mediaType: null }
                : { title: s.title ?? s.name ?? String(s), mediaType: MEDIA_TYPE_KO[s.mediaType] ?? s.mediaType ?? null },
            )
          : [];
        setSuggestions(results);
        setIsOpen(true);
        setActiveIdx(-1);
      } catch (err) {
        console.error('[MapFilterPanel] 자동완성 로드 실패:', err);
        setSuggestions([]);
      }
    }, 200);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setWorkKeyword(val);

    scheduleAutocomplete(val);
  };

  // 작품 선택 시 바로 onWorkSearch 호출
  const handleSelectItem = (candidate) => {
    if (!candidate) return;
    const title = candidate.title;
    // 선택 시 pending 자동완성 타이머 제거
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setWorkKeyword(title);
    onWorkSearch?.(title);
    setIsOpen(false);
    setSuggestions([]);
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
        // Enter 직접 검색 허용 — pending 자동완성 타이머 제거
        if (debounceRef.current) clearTimeout(debounceRef.current);
        onWorkSearch?.(workKeyword.trim());
        setIsOpen(false);
        setSuggestions([]);
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
                    scheduleAutocomplete(e.target.value);
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
                      <span className={styles.autocompleteTitle}>{item.title}</span>
                      {item.mediaType && <span className={styles.mediaTypeBadge}>[{item.mediaType}]</span>}
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
                    onClick={() => {
                      onToggleMediaType?.(type);
                      // 칩 선택 시 현재 검색어로 재검색 → MapPage에서 API 필터 위임
                      if (workKeyword.trim()) onWorkSearch?.(workKeyword.trim());
                    }}>
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
