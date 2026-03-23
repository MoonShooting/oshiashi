/**
 * @file MapLegend.jsx
 * @description 지도 좌하단 핀 범례 컴포넌트 (상수 기반 동적 생성)
 */
import React from 'react';
import { PIN_COLOR } from '@/constants/mapConstants';
import styles from '@/styles/MapLegend.module.css';

export default function MapLegend({ pinCount = 0 }) {
  // PIN_COLOR 상수의 키값들을 순회하며 범례 아이템을 생성합니다.
  // 태그 3종류(영화 드라마 애니메이션)만 필터링합니다.
  const legendItems = Object.entries(PIN_COLOR).filter(([key]) => key !== 'DEFAULT' && key !== 'SELECTED');

  return (
    <div className={styles.legend}>
      {legendItems.map(([type, config]) => (
        <div key={type} className={styles.item}>
          {/* 상수의 색상을 활용하여 범례 표시 */}
          <span className={styles.dot} style={{ backgroundColor: config.background }} />
          <span className={styles.label}>{type}</span>
        </div>
      ))}

      {/* 핀 개수 표시 */}
      <div className={styles.countBadge}>
        <strong>{pinCount}</strong> 장소 표시 중
      </div>
    </div>
  );
}
