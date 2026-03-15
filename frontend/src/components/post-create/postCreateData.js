const createSpot = (spot) => ({
  spotId: spot.spotId,
  name: spot.name,
  artworkTitle: spot.artworkTitle,
  address: spot.address,
  latitude: spot.latitude,
  longitude: spot.longitude,
  sceneImageUrl: spot.sceneImageUrl ?? null,
});

export const MOCK_POST_CREATE_ROUTES = [
  {
    id: 'route-201',
    routeId: 201,
    sourceType: 'MY_ROUTE',
    sourceLabel: '내 루트',
    title: '카마쿠라 슬램덩크 아침 루트',
    summary: '건널목부터 해안선까지 아침 햇살이 잘 들어오는 장면 위주로 묶은 루트입니다.',
    ownerDisplayName: '나의 저장 루트',
    bookmarkName: null,
    bookmarkedPostTitle: null,
    spots: [
      createSpot({
        spotId: 5001,
        name: '카마쿠라 고등학교 앞 건널목',
        artworkTitle: '슬램덩크',
        address: '1 Chome-1 Koshigoe, Kamakura',
        latitude: 35.3061,
        longitude: 139.4868,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 5002,
        name: '에노덴 코시고에 역 앞',
        artworkTitle: '슬램덩크',
        address: '3 Chome Koshigoe, Kamakura',
        latitude: 35.308,
        longitude: 139.4851,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 5003,
        name: '쇼난 해안 도로',
        artworkTitle: '슬램덩크',
        address: 'Koshigoe Coast Road, Kamakura',
        latitude: 35.3048,
        longitude: 139.4879,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 5004,
        name: '유이가하마 해변 입구',
        artworkTitle: '슬램덩크',
        address: 'Yuigahama, Kamakura',
        latitude: 35.3095,
        longitude: 139.5348,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=900&q=80',
      }),
    ],
  },
  {
    id: 'route-315',
    routeId: 315,
    sourceType: 'BOOKMARKED_POST_ROUTE',
    sourceLabel: '북마크한 게시물',
    title: '도쿄 황혼 교차로 루트',
    summary: '다른 사용자가 올린 게시글에서 북마크한 루트로, 황혼 시간대 비교 촬영에 좋은 스팟을 모았습니다.',
    ownerDisplayName: 'yotsuha_trip',
    bookmarkName: '다시 가고 싶은 도쿄 루트',
    bookmarkedPostTitle: '작중 시간대 그대로 걸은 너의 이름은 하루 코스',
    spots: [
      createSpot({
        spotId: 6101,
        name: '스가 신사 계단',
        artworkTitle: '너의 이름은',
        address: '5-6 Sugacho, Shinjuku City',
        latitude: 35.6887,
        longitude: 139.7218,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 6102,
        name: '신주쿠 교차로',
        artworkTitle: '너의 이름은',
        address: 'Shinjuku Crossing, Tokyo',
        latitude: 35.6903,
        longitude: 139.7006,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 6103,
        name: '요츠야 역 주변 골목',
        artworkTitle: '너의 이름은',
        address: 'Yotsuya, Shinjuku City',
        latitude: 35.6869,
        longitude: 139.7302,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1526483360412-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 6104,
        name: '시나노마치 보도교',
        artworkTitle: '너의 이름은',
        address: 'Shinanomachi, Shinjuku City',
        latitude: 35.6807,
        longitude: 139.7204,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 6105,
        name: '도쿄 도청 전망대 주변',
        artworkTitle: '너의 이름은',
        address: '2 Chome-8 Nishishinjuku, Tokyo',
        latitude: 35.6896,
        longitude: 139.6917,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80',
      }),
    ],
  },
  {
    id: 'route-108',
    routeId: 108,
    sourceType: 'MY_ROUTE',
    sourceLabel: '내 루트',
    title: '교토 정적 산책 루트',
    summary: '인물 없이 장면 자체를 담기 좋은 정적인 장소만 추려둔 루트입니다.',
    ownerDisplayName: '나의 저장 루트',
    bookmarkName: null,
    bookmarkedPostTitle: null,
    spots: [
      createSpot({
        spotId: 7201,
        name: '기온 골목 입구',
        artworkTitle: '교토 애니메이션 배경 연구',
        address: 'Gionmachi, Kyoto',
        latitude: 35.0037,
        longitude: 135.7788,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 7202,
        name: '야사카 신사 앞',
        artworkTitle: '교토 애니메이션 배경 연구',
        address: '625 Gionmachi Kitagawa, Kyoto',
        latitude: 35.0037,
        longitude: 135.7785,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80',
      }),
      createSpot({
        spotId: 7203,
        name: '마루야마 공원 산책로',
        artworkTitle: '교토 애니메이션 배경 연구',
        address: 'Maruyamacho, Kyoto',
        latitude: 35.0016,
        longitude: 135.7781,
        sceneImageUrl:
          'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=900&q=80',
      }),
    ],
  },
];

const parseNumber = (value) => {
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

export const normalizeRouteOption = (rawRoute, overrides = {}) => {
  const routeId = rawRoute.routeId ?? rawRoute.id ?? Date.now();
  const sourceType = overrides.sourceType ?? rawRoute.sourceType ?? 'MY_ROUTE';
  const sourceLabel =
    overrides.sourceLabel ??
    rawRoute.sourceLabel ??
    (sourceType === 'MY_ROUTE' ? '내 루트' : '북마크한 게시물');
  const rawSpots = rawRoute.spots ?? rawRoute.routeSpots ?? [];

  return {
    id: String(routeId),
    routeId,
    sourceType,
    sourceLabel,
    title: rawRoute.title ?? rawRoute.routeTitle ?? `루트 ${routeId}`,
    summary:
      rawRoute.summary ??
      rawRoute.description ??
      '게시물에 사용할 루트 설명이 아직 준비되지 않았습니다.',
    ownerDisplayName:
      rawRoute.ownerDisplayName ??
      rawRoute.userId ??
      overrides.ownerDisplayName ??
      '알 수 없는 작성자',
    bookmarkName: overrides.bookmarkName ?? rawRoute.bookmarkName ?? null,
    bookmarkedPostTitle:
      overrides.bookmarkedPostTitle ?? rawRoute.bookmarkedPostTitle ?? null,
    spots: rawSpots.map((spot, index) => normalizeSpot(spot, index)),
  };
};

export const createRouteEntries = (route) =>
  route.spots.map((spot, index) => ({
    id: `${route.id}-spot-${spot.spotId ?? index}`,
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
    experiencePhotos: [],
  }));

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
  experiencePhotos: [],
});

export const buildPostCreatePayload = ({ selectedRoute, title, entries }) => ({
  routeId: selectedRoute?.routeId ?? null,
  title: title.trim(),
  visibility: 'PUBLIC',
  entries: entries.map((entry, entryIndex) => ({
    order: entryIndex + 1,
    sourceType: entry.kind === 'custom-place' ? 'CUSTOM_PLACE' : 'ROUTE_SPOT',
    spotId: entry.spotId,
    placeName: entry.name.trim(),
    address: entry.address.trim(),
    artworkTitle: entry.artworkTitle.trim(),
    originalSceneImageUrl: entry.referenceImageUrl ?? entry.sceneImageUrl ?? null,
    photo: entry.experiencePhotos[0]
      ? {
          fileName:
            entry.experiencePhotos[0].file?.name ?? entry.experiencePhotos[0].name,
          imageUrl: entry.experiencePhotos[0].previewUrl,
          exifLatitude: null,
          exifLongitude: null,
          experience: entry.experiencePhotos[0].note.trim(),
        }
      : null,
  })),
});
