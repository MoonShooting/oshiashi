// 작품 탐색 페이지가 직접 들고 있던 화면 검토용 데이터를 data/post로 이동했습니다.
// 이후 API 응답으로 교체할 때도 페이지는 조립만 담당하고, 샘플 데이터 위치는 일관되게 유지됩니다.
export const MOCK_ARTWORKS = [
  {
    id: 'artwork-1',
    title: '너의 이름은',
    artworkTypeId: 'animation',
    artworkTypeName: '애니메이션',
    description: '도쿄와 시골 마을을 오가며 이어지는 대표적인 성지순례 작품입니다.',
  },
  {
    id: 'artwork-2',
    title: '토라도라',
    artworkTypeId: 'animation',
    artworkTypeName: '애니메이션',
    description: '학교와 거리 배경을 중심으로 캐릭터 동선이 선명한 학원물 작품입니다.',
  },
  {
    id: 'artwork-3',
    title: '러브라이브!',
    artworkTypeId: 'animation',
    artworkTypeName: '애니메이션',
    description: '아키하바라, 칸다, 오다이바 등 장소성과 팬 루트가 분명한 작품입니다.',
  },
  {
    id: 'artwork-4',
    title: '슬램덩크',
    artworkTypeId: 'movie',
    artworkTypeName: '영화',
    description: '현장감 있는 배경과 이동 동선을 따라가기 좋은 대표 농구 작품입니다.',
  },
  {
    id: 'artwork-5',
    title: '날씨의 아이',
    artworkTypeId: 'movie',
    artworkTypeName: '영화',
    description: '도쿄의 상징적인 풍경과 날씨 연출을 중심으로 장면 탐색이 가능한 작품입니다.',
  },
  {
    id: 'artwork-6',
    title: '스즈메의 문단속',
    artworkTypeId: 'movie',
    artworkTypeName: '영화',
    description: '전국 단위 이동 루트를 따라가며 장소를 모아보기 좋은 작품입니다.',
  },
  {
    id: 'artwork-7',
    title: 'Blue Giant',
    artworkTypeId: 'music',
    artworkTypeName: '음악',
    description:
      '재즈 공연장과 도시 배경을 중심으로 음악 팬 게시글 탐색이 가능한 컨텐츠입니다.',
  },
  {
    id: 'artwork-8',
    title: '봇치 더 록!',
    artworkTypeId: 'music',
    artworkTypeName: '음악',
    description: '라이브하우스와 밴드 동선을 중심으로 게시글이 연결될 수 있는 작품입니다.',
  },
  {
    id: 'artwork-9',
    title: 'NANA',
    artworkTypeId: 'music',
    artworkTypeName: '음악',
    description: '도시 라이프와 음악 씬을 함께 탐색하기 좋은 컨텐츠입니다.',
  },
  {
    id: 'artwork-10',
    title: '케이온!',
    artworkTypeId: 'animation',
    artworkTypeName: '애니메이션',
    description:
      '학교, 공연, 거리 풍경이 조합되어 태그 기반 게시글과 연결하기 좋은 작품입니다.',
  },
];
