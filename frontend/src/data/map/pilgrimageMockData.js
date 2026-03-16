// 지도 페이지의 임시 장소 목록은 라우트 페이지 바깥(data/map)으로 옮겨 관리합니다.
// 이렇게 두면 page는 진입/조립 역할만 맡고, 샘플 데이터는 별도 계층에서 관리할 수 있습니다.
export const DUMMY_PILGRIMAGE_SITES = [
  {
    id: "spot_1",
    title: "아키하바라 UDX (러브라이브!)",
    position: { lat: 35.7013, lng: 139.7725 },
  },
  {
    id: "spot_2",
    title: "스가 신사 (너의 이름은)",
    position: { lat: 35.6844, lng: 139.7226 },
  },
  {
    id: "spot_3",
    title: "시부야 스카이 (주술회전)",
    position: { lat: 35.6585, lng: 139.7023 },
  },
];

export const DEFAULT_LOCATION = { lat: 35.6895, lng: 139.6917 }; // 도쿄 도청
