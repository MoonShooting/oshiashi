/**
 * @file mapApi.js
 * @description 지도 관련 API 함수 모음 (FetchClient 기반)
 *
 * [주요 엔드포인트 정리]
 * - GET /api/v1/maps : 전체 장소 목록
 * - GET /api/v1/maps/search?keyword=&mediaType= : 장소 검색
 * - GET /api/v1/maps/{placeId} : 장소 상세
 * - GET /api/v1/maps/autocomplete?keyword= : 장소 자동완성
 *
 * [작품 검색 및 태그 관련 엔드포인트]
 * - GET /api/v1/artworks/maps/search?query= : 지도용 작품 검색 (TMDB 등 포함)
 * - POST /api/v1/artworks/import : TMDB 작품 DB 저장
 * - POST /api/v1/tags : 작품에 태그 매핑/생성
 */

import { FetchClient } from '@/api/FetchClient';

/** Long ID는 문자열로 통일 (표시·비교 시 정밀도 문제 방지) */
const toIdString = (value) => (value == null ? null : String(value));

/**
 * MapPlaceResponse 정규화.
 * mediaType은 백엔드 값 (PIN_COLOR / CSS 키와 일치).
 */
const normalizePlace = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const placeId = toIdString(raw.placeId);
  const lat = raw.latitude != null ? Number(raw.latitude) : null;
  const lng = raw.longitude != null ? Number(raw.longitude) : null;

  // SoT는 백엔드 DTO 필드명 mediaType.
  // 일부 Swagger 예시가 artworkType로 표기된 경우 호환 처리
  const typeNameRaw = raw.mediaType ?? raw.artworkType ?? raw.artworkTypeName;

  return {
    id: placeId,
    position: {
      lat,
      lng,
    },
    title: raw.name ?? '',
    placeId,
    artworkId: toIdString(raw.artworkId),
    artworkTitle: raw.artworkTitle ?? '',
    mediaType: typeNameRaw != null && String(typeNameRaw).trim() !== '' ? String(typeNameRaw) : '',
    name: raw.name ?? '',
    latitude: lat,
    longitude: lng,
    address: raw.address ?? '',
    sceneImageUrl: raw.sceneImageUrl ?? null,
    relatedPostCount: raw.relatedPostCount != null ? Number(raw.relatedPostCount) : 0,
    hasAddress: Boolean(raw.hasAddress),
    hasSceneImage: Boolean(raw.hasSceneImage),
  };
};

// 전체 장소 목록 가져오기
export const getPlaces = async () => {
  const raw = await FetchClient('/api/v1/maps', { method: 'GET' });
  return Array.isArray(raw) ? raw.map(normalizePlace).filter(Boolean) : [];
};

// 지도 장소 검색 (키워드 및 미디어타입 필터링 적용)
export const searchPlaces = async (keyword, mediaType = null) => {
  const params = new URLSearchParams({ keyword });
  if (mediaType && mediaType !== 'ALL') {
    params.append('mediaType', mediaType);
  }
  const raw = await FetchClient(`/api/v1/maps/search?${params.toString()}`, { method: 'GET' });
  return Array.isArray(raw) ? raw.map(normalizePlace).filter(Boolean) : [];
};

// 특정 장소 상세 정보 조회
export const getPlaceDetail = async (placeId) => {
  const raw = await FetchClient(`/api/v1/maps/${placeId}`, { method: 'GET' });
  return normalizePlace(raw);
};

// 지도 검색어 자동완성 (주로 장소명 혹은 단순 문자열 반환 시 사용)
export const autocompletePlaces = async (keyword) => {
  const params = new URLSearchParams({ keyword });
  const raw = await FetchClient(`/api/v1/maps/autocomplete?${params.toString()}`, { method: 'GET' });
  return Array.isArray(raw) ? raw.map((s) => String(s)) : [];
};

/**
 * 지도용 작품 검색 API (자동완성용)
 * 백엔드 통합 엔드포인트 대응: GET /api/v1/artworks/map/search?query=
 * * @param {string} keyword 검색할 작품명
 * @returns {Array} 작품 정보 배열 (title, overview, posterPath, mediaType 등 포함)
 */
export const searchMapArtworks = async (keyword) => {
  const params = new URLSearchParams({ query: keyword });
  const raw = await FetchClient(`/api/v1/artworks/maps/search?${params.toString()}`, { method: 'GET' });
  return Array.isArray(raw) ? raw : [];
};

// 외부 작품을 내부 DB에 저장 (사용자가 TMDB 검색결과를 클릭했을 때) POST /api/v1/artwork/import
export const importArtwork = async (artworkData) => {
  return await FetchClient('/api/v1/artworks/import', {
    method: 'POST',
    body: JSON.stringify(artworkData), // FetchClient 구현체에 따라 body 전달 방식이 다를 수 있음
  });
};

// 특정 작품에 태그 생성/연결하기
export const createTag = async (artworkId, tagName) => {
  return await FetchClient('/api/v1/tags', {
    method: 'POST',
    body: JSON.stringify({ artworkId, tagName }),
  });
};
