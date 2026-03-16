/**
 * @file MapLegend.jsx
 * @description 지도 좌하단 핀 범례 컴포넌트
 *
 * UI 캡처본 기준:
 * - 좌하단 고정
 * - 애니메이션(보라) / 드라마(핑크) / 영화(노랑) / 선택됨 표시
 * - 현재 표시 중인 핀 개수 표시
 *
 * @param {number} pinCount - 현재 지도에 표시된 핀 수
 */

import React from 'react';
import { MEDIA_TYPE, MEDIA_TYPE_LABEL, PIN_COLOR } from '@/constants/mapConstants';
import styles from '@/styles/MapLegend.module.css';

export default function MapLegend({ pinCount = 0 }) {
  const legendItems = Object.values(MEDIA_TYPE).map((type) => ({
    type,
    label: MEDIA_TYPE_LABEL[type],
    color: PIN_COLOR[type].background,
  }));

  return (
    <div className={styles.legend}>
      {legendItems.map(({ type, label, color }) => (
        <div key={type} className={styles.item}>
          <span className={styles.dot} style={{ background: color }} />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
      {/* 핀 개수 표시 */}
      <div className={styles.countBadge}>{pinCount} pins</div>
    </div>
  );
}
