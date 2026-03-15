/**
 * @file mapApi.js
 * @description 지도·핀·경로 관련 백엔드 API 호출 함수
 * [DB 테이블 ↔ 응답 필드 매핑 참고]
 * Spot 테이블 (지도 핀 원본)
 *   spot_id          → pin.id
 *   name             → pin.title
 *   latitude         → pin.position.lat
 *   longitude        → pin.position.lng
 *   address          → pin.address
 *   scene_image_url  → pin.placePhotoUrl   ← 장소 사진(팝업 카드 좌측)
 *
 * Artwork 테이블 (작품 정보)
 *   title            → pin.workName
 *   poster_url       → (핀 팝업 카드 등 확장 시 사용 가능)
 *
 * Artwork_type 테이블 (미디어 타입 enum)
 *   artwork_type_name → pin.mediaType  (예: "애니메이션" → "ANIME")
 *   ※ 백엔드가 ANIME | DRAMA | MOVIE 문자열로 내려줘야 PIN_COLOR 매핑 가능
 *      → 백엔드 팀에 Artwork_type_name을 영문 enum으로 내려줄 것 요청 필요
 *
 * Post_image 테이블 (게시물 대표 사진)
 *   image_url (sort_order=0)  → pin.postImageUrl  ← 팝업 카드 우측 게시물 사진
 *   ※ 백엔드에서 Spot 조회 시 해당 Spot 위치의 최신 게시물 대표 이미지를
 *      함께 JOIN해서 내려줄 것 요청 필요 (없으면 null)
 *
 * Route 테이블 (저장된 경로)
 *   route_id   → route.id
 *   title      → route.title
 *   is_public  → route.isPublic
 *   created_at → route.createdAt
 *
 * Route_spot 테이블 (경로 내 장소 순서)
 *   spot_id      → 각 Spot 객체
 *   visit_order  → 경로 내 순서 (1부터 시작)
 */

import { FetchClient } from '@/api/FetchClient';

// [응답 정규화]
// 백엔드 응답의 snake_case 필드를 프론트 camelCase로 변환
// 백엔드 응답 구조가 확정되면 이 함수를 수정할 것

/**
 * 백엔드 Spot 응답 → 프론트 pin 객체 변환
 *
 * 백엔드 기대 응답 구조:
 * {
 *   spotId: number,          // Spot.spot_id
 *   name: string,            // Spot.name
 *   latitude: number,        // Spot.latitude
 *   longitude: number,       // Spot.longitude
 *   address: string | null,  // Spot.address
 *   sceneImageUrl: string,   // Spot.scene_image_url → placePhotoUrl
 *   artworkTitle: string,    // Artwork.title → workName
 *   mediaType: string,       // Artwork_type.artwork_type_name → 'ANIME'|'DRAMA'|'MOVIE'
 *   postImageUrl: string | null  // Post_image.image_url (sort_order=0) → 팝업 게시물 사진
 * }
 */
const normalizeSpot = (raw) => ({
  id: String(raw.spotId),
  title: raw.name,
  position: {
    lat: parseFloat(raw.latitude),
    lng: parseFloat(raw.longitude),
  },
  address: raw.address ?? null,
  placePhotoUrl: raw.sceneImageUrl ?? null, // 팝업 카드 좌측: 장소 사진
  postImageUrl: raw.postImageUrl ?? null, // 팝업 카드 우측: 게시물 대표 사진
  workName: raw.artworkTitle ?? null,
  mediaType: raw.mediaType ?? 'DEFAULT', // 핀 색상 분기용 (PIN_COLOR 키와 일치)
  artworkId: raw.artworkId ?? null,
});

/**
 * 백엔드 Route 응답 → 프론트 route 객체 변환
 *
 * 백엔드 기대 응답 구조:
 * {
 *   routeId: number,         // Route.route_id
 *   title: string,           // Route.title
 *   isPublic: boolean,       // Route.is_public
 *   createdAt: string,       // Route.created_at
 *   spots: SpotResponse[]    // Route_spot join → visit_order 순 정렬된 Spot 목록
 * }
 */
const normalizeRoute = (raw) => ({
  id: String(raw.routeId),
  title: raw.title,
  isPublic: raw.isPublic,
  createdAt: raw.createdAt,
  spots: (raw.spots ?? []).map(normalizeSpot),
});

// Spot(핀) 조회 API

/**
 * 핀 목록 조회 (지도 메인 화면)
 *
 * GET /api/v1/spots?sort=popular&size=30
 *   sort: 'popular' (조회수순) | 'recent' (최신순)
 *   size: 한 번에 가져올 핀 수
 *
 * TODO: 백엔드 팀에 확인 필요
 *   - 정렬 파라미터명 (sort vs orderBy)
 *   - 도쿄 지역 필터링을 서버에서 할지 프론트에서 할지
 *   - 응답에 postImageUrl 포함 여부 (JOIN 필요)
 *
 * @param {string} sort
 * @param {number} size
 * @returns {Promise<Array>} 정규화된 핀 목록
 */
export const getPinList = async (sort = 'popular', size = 30) => {
  const raw = await FetchClient(`/api/v1/spots?sort=${sort}&size=${size}`);
  return Array.isArray(raw) ? raw.map(normalizeSpot) : [];
};

/**
 * 작품명 / 미디어타입 / 태그로 핀 검색
 *
 * GET /api/v1/spots/search?keyword=너의이름은&mediaType=ANIME
 *   keyword:   작품명 또는 장소명 (Spot.name, Artwork.title 대상)
 *   mediaType: ANIME | DRAMA | MOVIE (선택)
 *
 * TODO: 백엔드 팀에 확인 필요
 *   - 검색 대상 컬럼 (Spot.name + Artwork.title 동시 검색 가능한지)
 *   - Tag 테이블 연계 검색 지원 여부
 *
 * @param {string} keyword
 * @param {string|null} mediaType
 * @returns {Promise<Array>}
 */
export const searchSpots = async (keyword, mediaType = null) => {
  const params = new URLSearchParams({ keyword });
  if (mediaType) params.append('mediaType', mediaType);
  const raw = await FetchClient(`/api/v1/spots/search?${params}`);
  return Array.isArray(raw) ? raw.map(normalizeSpot) : [];
};

/**
 * 특정 Spot 상세 조회 (핀 클릭 시 팝업 카드용)
 *
 * GET /api/v1/spots/:spotId
 *
 * TODO: 핀 팝업 카드 상세 정보(게시물 수, 최근 게시물 사진 등) 연동 시 활성화
 *
 * @param {string|number} spotId  Spot.spot_id
 * @returns {Promise<Object>}
 */
export const getSpotDetail = async (spotId) => {
  const raw = await FetchClient(`/api/v1/spots/${spotId}`);
  return normalizeSpot(raw);
};

// Route(경로) CRUD API

/**
 * 내 경로 목록 조회 (마이페이지)
 *
 * GET /api/v1/routes/my
 *   ※ JWT 토큰 필수 (FetchClient가 자동 주입)
 *
 * @returns {Promise<Array>}
 */
export const getMyRoutes = async () => {
  const raw = await FetchClient('/api/v1/routes/my');
  return Array.isArray(raw) ? raw.map(normalizeRoute) : [];
};

/**
 * 경로 저장
 *
 * POST /api/v1/routes
 *
 * 요청 Body (백엔드 기대 구조):
 * {
 *   title: string,          // Route.title
 *   isPublic: boolean,      // Route.is_public (0|1)
 *   spotIds: number[],      // visit_order 순서대로 정렬된 Spot.spot_id 배열
 *                           // → 백엔드가 Route_spot 테이블에 visit_order 1,2,3... 으로 저장
 * }
 *
 * TODO: 백엔드 팀에 확인 필요
 *   - spotIds가 순서대로 전달되면 visit_order 자동 부여하는지
 *   - 또는 { spotId, visitOrder } 객체 배열로 전달해야 하는지
 *
 * @param {Object} routeData  { title, isPublic, spotIds }
 * @returns {Promise<Object>} 저장된 Route 객체
 */
export const postRoute = async (routeData) => {
  const raw = await FetchClient('/api/v1/routes', {
    method: 'POST',
    body: JSON.stringify({
      title: routeData.title,
      isPublic: routeData.isPublic ?? false,
      spotIds: routeData.spotIds, // [spotId1, spotId2, ...] 순서 = visit_order
    }),
  });
  return normalizeRoute(raw);
};

/**
 * 경로 삭제
 *
 * DELETE /api/v1/routes/:routeId
 *
 * @param {string|number} routeId  Route.route_id
 * @returns {Promise<string>}
 */
export const deleteRoute = async (routeId) => {
  return FetchClient(`/api/v1/routes/${routeId}`, { method: 'DELETE' });
};

/**
 * 경로 공개 여부 토글
 *
 * PATCH /api/v1/routes/:routeId
 * Body: { isPublic: boolean }
 *
 * TODO: 백엔드에 PATCH 엔드포인트 없으면 PUT으로 전체 교체 필요
 *
 * @param {string|number} routeId
 * @param {boolean} isPublic
 */
export const patchRouteVisibility = async (routeId, isPublic) => {
  return FetchClient(`/api/v1/routes/${routeId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublic }),
  });
};
