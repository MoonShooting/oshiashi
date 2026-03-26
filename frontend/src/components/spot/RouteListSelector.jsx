/**
 * @file RouteListSelector.jsx
 * @description 루트에 담긴 장소 플로팅 패널 (지도 우측 하단 고정)
 * - 접기/펼치기 토글
 * - 전체 영역 드래그앤드롭 순서 변경 적용
 * - 지하철, 버스 소요 시간 분리 표시
 */
import React, { useState, useRef, useCallback } from 'react';
import { useMapStore } from '@/stores/useMapStore';
import styles from '@/styles/RouteListSelector.module.css';

// 지하철, 버스로 항목 분리
const TRAVEL_MODES = [
  { key: 'WALKING', icon: '🚶', label: '도보' },
  { key: 'DRIVING', icon: '🚗', label: '자동차' },
  { key: 'TRANSIT_SUBWAY', icon: '🚇', label: '지하철' },
  { key: 'TRANSIT_BUS', icon: '🚌', label: '버스' },
];

// X시간 Y분 형태로 시간 포맷팅 함수 개선
const formatDuration = (sec) => {
  if (sec == null) return '-';
  const totalMin = Math.round(sec / 60);
  if (totalMin < 60) return `${totalMin}분`;

  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
};

// isEditMode 프롭스 추가 (수정 상태 판별용)
export default function RouteListSelector({ onSave, onReset, durations, isLocked = false, lockMessage = '', isEditMode = false }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [overIdx, setOverIdx] = useState(null);
  const dragIdx = useRef(null);

  const { selectedPlaces, removePlace, reorderPlaces, clearMap } = useMapStore();

  const handleDragStart = useCallback(
    (e, idx) => {
      if (isLocked) return;
      dragIdx.current = idx;
      e.dataTransfer.effectAllowed = 'move';
    },
    [isLocked],
  );

  const handleDragOver = useCallback(
    (e, idx) => {
      if (isLocked) return;
      e.preventDefault();
      if (overIdx !== idx) setOverIdx(idx);
    },
    [isLocked, overIdx],
  );

  const handleDrop = useCallback(
    (e, dropIdx) => {
      if (isLocked) return;
      e.preventDefault();
      setOverIdx(null);
      const from = dragIdx.current;
      if (from === null || from === dropIdx) return;
      const next = [...selectedPlaces];
      const [moved] = next.splice(from, 1);
      next.splice(dropIdx, 0, moved);
      reorderPlaces(next);
      dragIdx.current = null;
    },
    [isLocked, selectedPlaces, reorderPlaces],
  );

  const handleDragLeave = useCallback(() => setOverIdx(null), []);
  const handleDragEnd = useCallback(() => {
    dragIdx.current = null;
    setOverIdx(null);
  }, []);

  return (
    <div className={styles.panel}>
      <div className={styles.header} onClick={() => setIsExpanded((v) => !v)}>
        <span className={styles.title}>루트에 담긴 장소</span>
        <span className={styles.badge}>{selectedPlaces.length}</span>
        <span className={`${styles.chevron} ${isExpanded ? styles.chevronUp : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </span>
      </div>

      {isExpanded && (
        <div className={styles.body}>
          {isLocked && lockMessage ? <p className={styles.lockNotice}>{lockMessage}</p> : null}
          {selectedPlaces.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🗺️</div>
              <p className={styles.emptyText}>장소를 추가해주세요</p>
              <p className={styles.emptyDesc}>
                북마크, 지도 검색, 또는
                <br />
                지도를 직접 클릭해 추가하세요.
              </p>
            </div>
          ) : (
            <ul className={styles.list}>
              {selectedPlaces.map((place, idx) => (
                <li
                  key={place.id}
                  className={isLocked ? `${styles.item} ${styles.itemLocked}` : styles.item}
                  data-over={overIdx === idx ? 'true' : undefined}
                  // li 전체에 drag 이벤트 부여 (박스 전체 인식)
                  draggable={!isLocked}
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}>
                  {/* dragHandle 부분의 이벤트는 상위(li)로 올렸으므로 디자인용 요소로만 남김 */}
                  <span className={styles.dragHandle}>
                    <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                      <circle cx="2.5" cy="2.5" r="1.5" />
                      <circle cx="7.5" cy="2.5" r="1.5" />
                      <circle cx="2.5" cy="7" r="1.5" />
                      <circle cx="7.5" cy="7" r="1.5" />
                      <circle cx="2.5" cy="11.5" r="1.5" />
                      <circle cx="7.5" cy="11.5" r="1.5" />
                    </svg>
                  </span>
                  <div className={styles.numBadge}>{idx + 1}</div>
                  <div className={styles.thumb} style={{ background: place.color || '#374151' }} />
                  <div className={styles.info}>
                    <span className={styles.itemTitle}>{place.title || place.name}</span>
                    {place.workName && <span className={styles.itemWork}>{place.workName}</span>}
                  </div>
                  <button
                    className={styles.removeBtn}
                    title="루트에서 제거"
                    onClick={() => removePlace(place.placeId ?? place.spotId ?? place.id)}
                    disabled={isLocked}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {durations && selectedPlaces.length >= 2 && (
            <div className={styles.durationSection}>
              {TRAVEL_MODES.map(({ key, icon, label }) => (
                <div key={key} className={styles.durationRow}>
                  <span className={styles.durationIcon}>{icon}</span>
                  <span className={styles.durationLabel}>{label}</span>
                  {/* 포맷팅 함수 적용 */}
                  <span className={styles.durationValue}>{formatDuration(durations[key])}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.footer}>
            <button
              className={styles.resetBtn}
              onClick={() => {
                onReset?.();
                clearMap();
              }}
              disabled={isLocked}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.29" />
              </svg>
              초기화
            </button>
            <button className={styles.saveBtn} onClick={onSave} disabled={selectedPlaces.length < 1 || isLocked}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {/* isEditMode에 따라 텍스트 분기 */}
              {isEditMode ? '수정' : '저장'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
