import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from '@/styles/MapFilterPanel.module.css';
import { autocompletePlaces, importArtwork } from '@/api/mapApi.js';
import { PIN_COLOR } from '@/constants/mapConstants';

export default function MapFilterPanel({ activeMediaTypes = [], onToggleMediaType, onWorkSearch, serverMediaTypes = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [workKeyword, setWorkKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const isComposing = useRef(false); // 한글 입력 조합 상태 관리

  const FIXED_MEDIA_TYPES = ['영화', '드라마', '애니메이션']; //api 호출하지말고 고정값 사용

  // 자동완성 호출 로직 (백엔드 ExternalArtworkCandidateResponse 대응)
  const scheduleAutocomplete = useCallback((val) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const query = val?.trim();
    if (!query || query.length <= 1) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const data = await autocompletePlaces(query);
        // 백엔드에서 온 데이터가 배열인지 확인하고 상태 업데이트
        setSuggestions(Array.isArray(data) ? data : []);
        setIsOpen(true);
        setActiveIdx(-1);
      } catch (err) {
        console.error('[MapFilterPanel] 자동완성 로드 실패:', err);
        setSuggestions([]);
      }
    }, 300);
  }, []);

  // 입력 핸들러 (한글 씹힘 방지 로직 포함)
  const handleInputChange = (e) => {
    const val = e.target.value;
    setWorkKeyword(val);

    // 한글 조합 중일 때는 API 호출을 하지 않고 기다렸다가, 조합이 끝나면 호출하거나
    // 타이핑 속도에 맞춰 디바운스만 태웁니다.
    if (!isComposing.current) {
      scheduleAutocomplete(val);
    }
  };

  // 작품 선택 시 (Import API 연동)
  const handleSelectItem = async (candidate) => {
    if (!candidate) return;

    // 데이터 구조에 따른 제목 추출 (객체면 .title, 문자열이면 그대로)
    const title = typeof candidate === 'object' ? candidate.title : candidate;

    try {
      // TMDB 객체 데이터가 넘어온 경우 (ExternalArtworkCandidateResponse)
      if (typeof candidate === 'object' && candidate.mediaType) {
        const saved = await importArtwork({
          title: candidate.title,
          posterPath: candidate.posterPath,
          overview: candidate.overview,
          mediaType: candidate.mediaType,
          genreIds: candidate.genreIds,
        });
        const finalTitle = saved.title || title;
        setWorkKeyword(finalTitle);
        onWorkSearch?.(finalTitle);
      } else {
        // 단순 DB 검색 결과인 경우
        setWorkKeyword(title);
        onWorkSearch?.(title);
      }
    } catch (err) {
      console.error('[MapFilterPanel] 작품 연동 실패:', err);
      // 에러 시에도 일단 검색은 시도
      onWorkSearch?.(title);
    } finally {
      setIsOpen(false);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (isComposing.current) return; // 한글 조합 중 엔터로 인한 중복 호출 방지

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

  // 외부 클릭 시 닫기
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
                    handleInputChange(e); // 조합 완료 후 최종 값으로 검색
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="작품명 검색..."
                  autoComplete="off"
                />
              </div>

              {isOpen && suggestions.length > 0 && (
                <ul className={styles.autocompleteList}>
                  {suggestions.map((item, idx) => {
                    const title = typeof item === 'object' ? item.title : item;
                    return (
                      <li
                        key={idx}
                        className={`${styles.autocompleteItem} ${idx === activeIdx ? styles.active : ''}`}
                        onClick={() => handleSelectItem(item)}>
                        {title}
                      </li>
                    );
                  })}
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
