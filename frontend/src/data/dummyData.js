// 1. 지도에 표시될 성지순례 장소들 (SpotPage 중앙 지도용)
export const DUMMY_PILGRIMAGE_SITES = [
  {
    id: 'spot_1',
    name: '아키하바라 UDX',
    title: '아키하바라 UDX (러브라이브!)',
    position: { lat: 35.7013, lng: 139.7725 },
    address: '도쿄도 치요다구 소토칸다 4-14-1',
    mediaType: 'ANIME',
    thumbnail: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=300', // 더미 이미지
  },
  {
    id: 'spot_2',
    name: '스가 신사',
    title: '스가 신사 (너의 이름은)',
    position: { lat: 35.6844, lng: 139.7226 },
    address: '도쿄도 신주쿠구 스가초 5',
    mediaType: 'MOVIE',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300',
  },
  {
    id: 'spot_3',
    name: '시부야 스카이',
    title: '시부야 스카이 (사일런트)',
    position: { lat: 35.6585, lng: 139.7023 },
    address: '도쿄도 시부야구 시부야 2-24-12',
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
    name: '시부야 스카이',
    address: '도쿄도 시부야구 시부야 2-24-12',
    position: { lat: 35.6585, lng: 139.7023 },
  },
  {
    id: 'b2',
    folderId: 'f1',
    name: '아키하바라 UDX',
    address: '도쿄도 치요다구 소토칸다 4-14-1',
    position: { lat: 35.7013, lng: 139.7725 },
  },
];
