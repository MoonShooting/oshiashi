/**
 * @file mapConstants.js
 * @description 지도 설정 및 미디어 타입별 디자인 상수
 */

// 1. 지도 기본 설정 (Vite 환경 변수 사용)
export const DEFAULT_CENTER = {
  lat: parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 35.6812,
  lng: parseFloat(import.meta.env.VITE_DEFAULT_LNG) || 139.7671,
};

export const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_ZOOM, 10) || 11;

export const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

// 미디어 타입별 디자인 설정
// DB 응답값(애니메이션, 드라마, 영화)을 키로 사용하여 UI 스타일을 결정합니다.
export const PIN_COLOR = {
  애니메이션: {
    background: '#7c3aed',
    border: '#a855f7',
    glyph: '#ffffff',
    icon: '▶', // 아이콘 추가
  },
  드라마: {
    background: '#be185d',
    border: '#ec4899',
    glyph: '#ffffff',
    icon: '📺', // 아이콘 추가
  },
  영화: {
    background: '#b45309',
    border: '#f59e0b',
    glyph: '#ffffff',
    icon: '🎬', // 아이콘 추가
  },
  DEFAULT: {
    background: '#374151',
    border: '#6b7280',
    glyph: '#ffffff',
    icon: '📍', // 기본 아이콘
  },
  SELECTED: {
    background: '#e91e8c',
    border: '#ff6ac2',
    glyph: '#ffffff',
  },
};

// 3. 기타 시스템 설정
export const SEARCH_RADIUS = 10000; // 반경 10km 내
export const MAX_SPOT_COUNT = 10; //보여줄 최대 핀 갯수 10개
