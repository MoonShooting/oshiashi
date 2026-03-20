/**
 * @file mapConstants.js
 * @description 지도 관련 상수 정의
 * - 미디어 타입별 핀 색상, 기본 좌표, 줌 레벨 등
 * - 백엔드 API 미디어 타입 enum 값과 일치시킬 것
 */

// 지도 기본 설정

export const DEFAULT_CENTER = {
  lat: parseFloat(import.meta.env.VITE_DEFAULT_LAT) || 35.6812,
  lng: parseFloat(import.meta.env.VITE_DEFAULT_LNG) || 139.7671,
};

export const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_DEFAULT_ZOOM) || 11;

export const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

// 미디어 타입 정의
// TODO: 백엔드 API 명세 확정 후 enum 값 맞추기

export const MEDIA_TYPE = {
  ANIME: 'ANIME',
  DRAMA: 'DRAMA',
  MOVIE: 'MOVIE',
};

export const MEDIA_TYPE_LABEL = {
  [MEDIA_TYPE.ANIME]: '애니메이션',
  [MEDIA_TYPE.DRAMA]: '드라마',
  [MEDIA_TYPE.MOVIE]: '영화',
};

// 미디어 타입별 핀 색상 (UI 캡처본 기준)
// - 애니메이션: 보라(#9b59b6)
// - 드라마: 핑크/로즈(#e91e8c)
// - 영화: 노랑(#f39c12)
// - 선택됨: 핑크(#e91e8c) + 강조

export const PIN_COLOR = {
  [MEDIA_TYPE.ANIME]: {
    background: '#7c3aed',
    border: '#a855f7',
    glyph: '#ffffff',
    label: '애니',
  },
  [MEDIA_TYPE.DRAMA]: {
    background: '#be185d',
    border: '#ec4899',
    glyph: '#ffffff',
    label: '드라마',
  },
  [MEDIA_TYPE.MOVIE]: {
    background: '#b45309',
    border: '#f59e0b',
    glyph: '#ffffff',
    label: '영화',
  },
  DEFAULT: {
    background: '#374151',
    border: '#6b7280',
    glyph: '#ffffff',
    label: '기타',
  },
  SELECTED: {
    background: '#e91e8c',
    border: '#ff6ac2',
    glyph: '#ffffff',
  },
};

// 정렬 타입
// TODO: /api/v1/posts/top?sort= 파라미터 값 확정 후 수정

export const SORT_TYPE = {
  POPULAR: 'popular',
  RECENT: 'recent',
};

export const SORT_TYPE_LABEL = {
  [SORT_TYPE.POPULAR]: '인기',
  [SORT_TYPE.RECENT]: '최신',
};

// 검색 반경 (Places API textSearch)

export const SEARCH_RADIUS = 10000; // 10km

// 경로 생성 최대 핀 개수

export const MAX_SPOT_COUNT = 10;
