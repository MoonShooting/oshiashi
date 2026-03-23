/*
[postCreateDraftUtils]
- 작성 페이지에서 route/spot 데이터를 "입력 카드(entries)" 형태로 변환하는 전용 유틸
- UI 컴포넌트가 API 응답 스키마를 직접 알지 않도록 중간 계층 역할을 담당
*/
const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
};

const normalizeSpot = (spot, index) => ({
  spotId: spot.spotId ?? spot.id ?? null,
  name: spot.name ?? spot.spotName ?? `장소 ${index + 1}`,
  artworkTitle: spot.artworkTitle ?? spot.workName ?? spot.artworkName ?? '작품 정보 미정',
  address: spot.address ?? '',
  latitude: parseNumber(spot.latitude ?? spot.position?.lat),
  longitude: parseNumber(spot.longitude ?? spot.position?.lng),
  sceneImageUrl:
    spot.sceneImageUrl ??
    spot.sceneImgUrl ??
    spot.placePhotoUrl ??
    spot.originalSceneImageUrl ??
    null,
});

// 선택한 루트의 장소 배열을 "작성 카드 배열"로 변환합니다.
export const createRouteEntries = (route) =>
  (route.spots ?? []).map((rawSpot, index) => {
    const spot = normalizeSpot(rawSpot, index);
    const spotKey = spot.spotId ?? index;

    return {
      id: `${route.id}-spot-${spotKey}`,
      kind: 'route-spot',
      sortOrder: index,
      spotId: spot.spotId,
      name: spot.name,
      artworkTitle: spot.artworkTitle,
      address: spot.address,
      latitude: spot.latitude,
      longitude: spot.longitude,
      sceneImageUrl: spot.sceneImageUrl,
      referenceImageUrl: null,
      referenceImagePreviewUrl: null,
      referenceImageUploadStatus: 'idle',
      referenceImageUploadError: '',
      referenceImageFileName: '',
      experiencePhotos: [],
    };
  });

// 사용자가 수동으로 추가하는 장소 카드 기본값입니다.
export const createCustomPlaceEntry = (sortOrder = 0) => ({
  id: `custom-place-${Date.now()}-${sortOrder}`,
  kind: 'custom-place',
  sortOrder,
  spotId: null,
  name: '',
  artworkTitle: '',
  address: '',
  latitude: null,
  longitude: null,
  sceneImageUrl: null,
  referenceImageUrl: null,
  referenceImagePreviewUrl: null,
  referenceImageUploadStatus: 'idle',
  referenceImageUploadError: '',
  referenceImageFileName: '',
  experiencePhotos: [],
});
