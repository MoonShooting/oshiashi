/**
 * @description 루트에 담긴 장소 플로팅 패널 (지도 우측 하단 고정)
 *
 * - 접기/펼치기 토글
 * - 드래그앤드롭으로 순서 변경
 * - 초기화: selectedPlaces 전체 해제
 * - 저장: onSave 콜백 (SpotPage에서 모달+리스트업데이트 처리)
 */

import React, { useState, useRef, useCallback } from 'react';
import { useMapStore } from '@/stores/useMapStore';
import styles from '@/styles/RouteListSelector.module.css';

export default function RoutePanel({ onSave }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [overIdx, setOverIdx] = useState(null);
  const dragIdx = useRef(null);

  const { selectedPlaces, removePlace, reorderPlaces, clearMap } = useMapStore();

  const handleDragStart = useCallback((e, idx) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback(
    (e, idx) => {
      e.preventDefault();
      if (overIdx !== idx) setOverIdx(idx);
    },
    [overIdx],
  );

  const handleDrop = useCallback(
    (e, dropIdx) => {
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
    [selectedPlaces, reorderPlaces],
  );

  const handleDragLeave = useCallback(() => setOverIdx(null), []);
  const handleDragEnd = useCallback(() => {
    dragIdx.current = null;
    setOverIdx(null);
  }, []);

  return (
    <div className={styles.panel}>
      {/* 헤더 (클릭으로 접기/펼치기) */}
      <div className={styles.header} onClick={() => setIsExpanded((v) => !v)}>
        <span className={styles.title}>루트에 담긴 장소</span>
        <span className={styles.badge}>{selectedPlaces.length}</span>
        <span className={`${styles.chevron} ${isExpanded ? styles.chevronUp : ''}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </span>
      </div>

      {/* 본문 (펼쳤을 때만) */}
      {isExpanded && (
        <div className={styles.body}>
          {selectedPlaces.length === 0 ? (
            /* 빈 상태 */
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🗺️</div>
              <p className={styles.emptyText}>장소를 추가해주세요</p>
              <p className={styles.emptyDesc}>
                북마크 또는 지도 검색 결과에서
                <br />
                루트에 담을 수 있어요.
              </p>
            </div>
          ) : (
            /* 드래그앤드롭 목록 */
            <ul className={styles.list}>
              {selectedPlaces.map((place, idx) => (
                <li
                  key={place.id}
                  className={styles.item}
                  data-over={overIdx === idx ? 'true' : undefined}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}>
                  {/* 드래그 핸들 */}
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

                  {/* 순서 번호 */}
                  <div className={styles.numBadge}>{idx + 1}</div>

                  {/* 썸네일 placeholder */}
                  <div className={styles.thumb} style={{ background: place.color || '#374151' }} />

                  {/* 장소 정보 */}
                  <div className={styles.info}>
                    <span className={styles.itemTitle}>{place.title}</span>
                    {place.workName && <span className={styles.itemWork}>{place.workName}</span>}
                  </div>

                  {/* 삭제 버튼 */}
                  <button className={styles.removeBtn} title="루트에서 제거" onClick={() => removePlace(place.id)}>
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

          {/* 푸터: 초기화 / 저장 */}
          <div className={styles.footer}>
            <button className={styles.resetBtn} onClick={clearMap}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.29" />
              </svg>
              초기화
            </button>
            <button className={styles.saveBtn} onClick={onSave} disabled={selectedPlaces.length < 1}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
