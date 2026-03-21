/**
 * @file MapFilterPanel.jsx
 * @description 지도 좌측 필터 패널 (MapPage 전용)
 *
 * UI 캡처본 기준:
 * - 좌측 상단 고정
 * - 접기/펼치기 토글
 * - 작품 검색 입력
 * - 미디어 타입 필터 (애니 / 드라마 / 영화)
 * - 정렬 (최신 / 인기)
 *
 * @param {Function} onFilterChange - 필터 변경 시 콜백
 */

import React, { useState } from 'react';
import { useMapStore } from '@/stores/useMapStore';
import { MEDIA_TYPE, MEDIA_TYPE_LABEL, SORT_TYPE, SORT_TYPE_LABEL, PIN_COLOR } from '@/constants/mapConstants';
import styles from '@/styles/MapFilterPanel.module.css';

export default function MapFilterPanel({ onFilterChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [workKeyword, setWorkKeyword] = useState('');

  const { activeMediaTypes, sortType, toggleMediaType, fetchHotPlaces, searchByWork, clearMediaFilter } = useMapStore();

  // 미디어 타입 토글

  const handleMediaToggle = (type) => {
    toggleMediaType(type);
    onFilterChange?.();
  };

  // 정렬 변경

  const handleSortChange = (sort) => {
    fetchHotPlaces(sort);
    onFilterChange?.();
  };

  // 작품명 검색

  const handleWorkSearch = () => {
    if (!workKeyword.trim()) {
      clearMediaFilter();
      fetchHotPlaces(sortType);
    } else {
      // 활성화된 미디어 타입 중 첫 번째로 검색 (복수 타입 지원은 TODO)
      searchByWork(workKeyword, activeMediaTypes[0] || null);
    }
    onFilterChange?.();
  };

  return (
    <div className={`${styles.panel}`}>
      {/* 헤더 */}
      <div className={styles.header}>
        <span className={styles.title}>필터</span>
        <button className={styles.toggleBtn} onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? '필터 펼치기' : '필터 접기'}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      </div>

      {/* 필터 내용 (접히면 숨김) */}
      {!collapsed && (
        <div className={styles.body}>
          {/* 작품 검색 */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>작품</label>
            <div className={styles.workSearchRow}>
              <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                className={styles.workInput}
                value={workKeyword}
                onChange={(e) => setWorkKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWorkSearch()}
                placeholder="작품명 검색..."
              />
            </div>
          </div>

          {/* 미디어 타입 */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>미디어 타입</label>
            <div className={styles.chipRow}>
              {Object.values(MEDIA_TYPE).map((type) => {
                // activeMediaTypes가 없으면 빈 배열로 취급해서 includes 에러를 방지합니다.
                const isActive = (activeMediaTypes || []).includes(type);

                const color = PIN_COLOR[type];
                return (
                  <button
                    key={type}
                    className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                    onClick={() => handleMediaToggle(type)}
                    style={isActive ? { borderColor: color.border } : {}}>
                    {/* 미디어 타입 아이콘 */}
                    <span className={styles.chipIcon}>
                      {type === MEDIA_TYPE.ANIME && '▶'}
                      {type === MEDIA_TYPE.DRAMA && '📺'}
                      {type === MEDIA_TYPE.MOVIE && '🎬'}
                    </span>
                    {MEDIA_TYPE_LABEL[type]}
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
