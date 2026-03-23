/**
 * @file mapApi.js
 * @description 지도 관련 API 함수 모음
 *
 * [엔드포인트 정리]
 * MapController (/api/v1/map):
 *   GET  /api/v1/map                       → 전체 장소 목록
 *   GET  /api/v1/map/nearby?lat=&lng=&radiusKm=&mediaType=&limit= → 근처 장소
 *   GET  /api/v1/map/search?keyword=&mediaType= → 장소 검색
 *   GET  /api/v1/map/{placeId}             → 장소 상세
 *   GET  /api/v1/map/autocomplete?keyword= → 자동완성 작품명 목록 (TMDB)
 *
 * ArtworkSearchController (/api/v1/artwork):
 *   GET  /api/v1/artwork/map/search?query= → TMDB 외부 작품 후보 검색
 *   POST /api/v1/artwork/import            → TMDB 작품 DB 저장
 *
 * [MapPlaceResponse — Swagger/DTO와 동일한 camelCase]
 *   placeId, artworkId, artworkTitle, mediaType (DB artwork_type_name; Swagger에 artworkType로 보이는 경우 폴백 처리),
 *   name, latitude, longitude, address, sceneImageUrl,
 *   relatedPostCount, hasAddress, hasSceneImage
 */
import { FetchClient } from '@/api/FetchClient';

/** Long ID는 문자열로 통일 (표시·비교 시 정밀도 문제 방지) */
const toIdString = (value) => (value == null ? null : String(value));

/**
 * MapPlaceResponse 정규화. mediaType은 백엔드 값 (PIN_COLOR / CSS 키와 일치).
 */
const normalizePlace = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const placeId = toIdString(raw.placeId);
  const lat = raw.latitude != null ? Number(raw.latitude) : null;
  const lng = raw.longitude != null ? Number(raw.longitude) : null;
  // SoT는 백엔드 DTO 필드명 mediaType. 일부 Swagger 예시가 artworkType로 표기된 경우 호환
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

// GET /api/v1/map
export const getPlaces = async () => {
  const raw = await FetchClient('/api/v1/map', { method: 'GET' });
  return Array.isArray(raw) ? raw.map(normalizePlace).filter(Boolean) : [];
};

/**
 * GET /api/v1/map/nearby
 * @param {number} lat
 * @param {number} lng
 * @param {{ radiusKm?: number, mediaType?: string|null, limit?: number }} [options]
 */
export const getNearbyPlaces = async (lat, lng, options = {}) => {
  const { radiusKm = 10, mediaType = null, limit = 10 } = options;
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
    limit: String(limit),
  });
  if (mediaType && mediaType !== 'ALL') {
    params.append('mediaType', mediaType);
  }
  const raw = await FetchClient(`/api/v1/map/nearby?${params.toString()}`, { method: 'GET' });
  return Array.isArray(raw) ? raw.map(normalizePlace).filter(Boolean) : [];
};

// GET /api/v1/map/search?keyword=&mediaType=
export const searchPlaces = async (keyword, mediaType = null) => {
  const params = new URLSearchParams({ keyword });
  if (mediaType && mediaType !== 'ALL') params.append('mediaType', mediaType);
  const raw = await FetchClient(`/api/v1/map/search?${params.toString()}`, { method: 'GET' });
  return Array.isArray(raw) ? raw.map(normalizePlace).filter(Boolean) : [];
};

// GET /api/v1/map/{placeId}
export const getPlaceDetail = async (placeId) => {
  const raw = await FetchClient(`/api/v1/map/${placeId}`, { method: 'GET' });
  return normalizePlace(raw);
};

// GET /api/v1/map/autocomplete?keyword= → string[]
export const autocompletePlaces = async (keyword) => {
  const params = new URLSearchParams({ keyword });
  const raw = await FetchClient(`/api/v1/map/autocomplete?${params.toString()}`, { method: 'GET' });
  return Array.isArray(raw) ? raw.map((s) => String(s)) : [];
};

// GET /api/v1/artwork/types
// ArtworkController에 구현된 미디어 타입(태그)
export const getArtworkTypes = async () => {
  const raw = await FetchClient('/api/v1/artworks/types', { method: 'GET' });
  return Array.isArray(raw) ? raw : [];
};

// TMDB 검색 (후보군 가져오기) GET /api/v1/artwork/map/search?query=
export const searchExternalArtworks = async (query) => {
  return await FetchClient(`/api/v1/artworks/map/search?query=${query}`, { method: 'GET' });
};

// 작품 선택하여 DB에 저장 POST /api/v1/artwork/import
export const importArtwork = async (artworkData) => {
  return await FetchClient('/api/v1/artworks/import', {
    method: 'POST',
    body: JSON.stringify(artworkData), // FetchClient 구현체에 따라 body 전달 방식이 다를 수 있음
  });
};
