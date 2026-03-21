// 1. 지도에 표시될 성지순례 장소들 (SpotPage 중앙 지도용)
export const DUMMY_PILGRIMAGE_SITES = [
  {
    id: 'spot_1',
    name: '아키하바라 UDX',
    title: '아키하바라 UDX (러브라이브!)',
    position: { lat: 35.7013, lng: 139.7725 },
    address: '〒101-0021 東京都千代田区外神田4-14-1',
    mediaType: 'ANIME',
    thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300',
  },
  {
    id: 'spot_2',
    name: '스가 신사',
    title: '스가 신사 (너의 이름은)',
    position: { lat: 35.6844, lng: 139.7226 },
    address: '〒160-0018 東京都新宿区須賀町5',
    mediaType: 'MOVIE',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300',
  },
  {
    id: 'spot_3',
    name: '시부야 스크램블 교차로',
    title: '시부야 스크램블 교차로 (사일런트)',
    position: { lat: 35.6595, lng: 139.7006 },
    address: '〒150-0043 東京都渋谷区道玄坂2-2-1',
    mediaType: 'DRAMA',
    thumbnail: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=300',
  },
];

// 2. 기본 지도 위치
export const DEFAULT_LOCATION = { lat: 35.6895, lng: 139.6917 }; // 도쿄 도청

// 3. 좌측 사이드바 - 내 저장 폴더 목록
export const DUMMY_SPOT_FOLDERS = [
  { id: 'f1', name: '도쿄 정주행', count: 3 },
  { id: 'f2', name: '너의 이름은 성지', count: 5 },
  { id: 'f3', name: '가고 싶은 곳', count: 2 },
];

// 4. 폴더 내부에 저장되어 있는 장소 데이터 (SpotSidePanel에서 사용)
export const DUMMY_BOOKMARKED_SPOTS = [
  {
    id: 'b1',
    folderId: 'f1',
    name: '시부야 스크램블 교차로',
    address: '〒150-0043 東京都渋谷区道玄坂2-2-1',
    position: { lat: 35.6595, lng: 139.7006 },
    color: 'linear-gradient(135deg, #6b46c1, #ec4899)',
    workName: '사일런트',
  },
  {
    id: 'b2',
    folderId: 'f1',
    name: '아키하바라 UDX',
    address: '〒101-0021 東京都千代田区外神田4-14-1',
    position: { lat: 35.7013, lng: 139.7725 },
    color: 'linear-gradient(135deg, #1e3a5f, #4f8ef7)',
    workName: '러브라이브!',
  },
];

// 5. 핀 클릭 시 우측 상세 드로어에 표시될 상세 데이터
// TODO: 백엔드 연동 시 GET /api/v1/spots/{spotId} 로 교체
export const DUMMY_SPOT_DETAILS = {
  spot_1: {
    id: 'spot_1',
    name: '아키하바라 UDX',
    address: '〒101-0021 東京都千代田区外神田4-14-1',
    description: "러브라이브! µ's 멤버들이 라이브를 펼치던 무대 배경. 애니 속 명장면을 그대로 재현할 수 있는 대표 성지.",
    googleMapsUrl: 'https://maps.google.com/?q=35.7013,139.7725',
    artwork: {
      artworkId: 'a1',
      title: '러브라이브! School idol project',
      artworkType: '애니메이션',
      spotCount: 8,
      posterUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400',
    },
    // TODO: GET /api/v1/posts?spotId=spot_1&status=public&limit=6
    posts: [
      { id: 'p1', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200', author: 'akiba.lover' },
      { id: 'p2', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200', author: 'minato.tae' },
      { id: 'p3', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200', author: 'tokyo.iro' },
      { id: 'p4', imageUrl: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=200', author: 'flower.boo' },
      { id: 'p5', imageUrl: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=200', author: 'route.note' },
      { id: 'p6', imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=200', author: 'ykcth.scene' },
    ],
  },
  spot_2: {
    id: 'spot_2',
    name: '스가 신사',
    address: '〒160-0018 東京都新宿区須賀町5',
    description: '너의 이름은에서 타키와 미츠하가 처음 만나는 계단 장면의 촬영지. 황혼 무렵 방문하면 극 중 분위기를 그대로 느낄 수 있음.',
    googleMapsUrl: 'https://maps.google.com/?q=35.6844,139.7226',
    artwork: {
      artworkId: 'a2',
      title: '너의 이름은',
      artworkType: '애니메이션 영화',
      spotCount: 12,
      posterUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400',
    },
    // TODO: GET /api/v1/posts?spotId=spot_2&status=public&limit=6
    posts: [
      { id: 'p7', imageUrl: 'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=200', author: 'kimi.no.na' },
      { id: 'p8', imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=200', author: 'shrine.walk' },
      { id: 'p9', imageUrl: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=200', author: 'shinjuku.log' },
      { id: 'p10', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200', author: 'tokyo.dusk' },
      { id: 'p11', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200', author: 'yubi.hime' },
      { id: 'p12', imageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200', author: 'mitsuha.fan' },
    ],
  },
  spot_3: {
    id: 'spot_3',
    name: '시부야 스크램블 교차로',
    address: '〒150-0043 東京都渋谷区道玄坂2-2-1',
    description: '사일런트의 마지막 연출과 감정선이 교차하던 상징적인 장소. 황혼 무렵 방문 시 드라마 속 분위기를 그대로 재현 가능.',
    googleMapsUrl: 'https://maps.google.com/?q=35.6595,139.7006',
    artwork: {
      artworkId: 'a3',
      title: '비 오는 날, 황혼도로 풍경',
      artworkType: '드라마',
      spotCount: 3,
      posterUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400',
    },
    // TODO: GET /api/v1/posts?spotId=spot_3&status=public&limit=6
    posts: [
      { id: 'p13', imageUrl: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=200', author: 'flower.boo' },
      { id: 'p14', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=200', author: 'minato.tae' },
      { id: 'p15', imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200', author: 'bi.oineun.nal' },
      { id: 'p16', imageUrl: 'https://images.unsplash.com/photo-1549693578-d683be217e58?w=200', author: 'ykcth.scene' },
      { id: 'p17', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=200', author: 'tiffany.lve' },
      { id: 'p18', imageUrl: 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=200', author: 'tokyo.frame' },
    ],
  },
};
