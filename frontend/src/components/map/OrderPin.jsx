import React from 'react';

/**
 * 순서 번호가 표시되는 원형 핀 (SpotPage용)
 */
export default function OrderPin({ num, colors, isSelected }) {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: colors?.background || '#333',
        border: `2px solid ${colors?.border || '#fff'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        boxShadow: isSelected ? `0 0 0 3px ${colors?.border}55, 0 4px 12px rgba(0,0,0,0.4)` : '0 2px 8px rgba(0,0,0,0.4)',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}>
      {num}
    </div>
  );
}
