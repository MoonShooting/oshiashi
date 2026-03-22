// 게시판 타입 확장 대비용 상수입니다. 현재는 자유게시판(FREE)만 사용합니다.
export const BOARD_TYPES = {
  FREE: 'FREE',
};

// 댓글 목업 객체 형태를 통일합니다.
const createComment = (comment) => ({
  id: comment.id,
  author: comment.author,
  avatarLabel: comment.avatarLabel,
  timeLabel: comment.timeLabel,
  content: comment.content,
});

// 상세 페이지의 장소(entry) 목업 구조를 통일합니다.
const createEntry = (entry) => ({
  id: entry.id,
  title: entry.title,
  artworkTitle: entry.artworkTitle,
  address: entry.address,
  lat: entry.lat,
  lng: entry.lng,
  referenceImageUrl: entry.referenceImageUrl,
  userImageUrl: entry.userImageUrl,
  sceneNote: entry.sceneNote,
  soundtrack: entry.soundtrack,
  visitTimeLabel: entry.visitTimeLabel,
  moodTags: entry.moodTags,
});

export const mockPostDetails = [
  {
    id: '1',
    routeId: 201,
    title: '작중 시간대 그대로 걸은 너의 이름은 하루 코스',
    boardType: BOARD_TYPES.FREE,
    summary:
      '황혼 시간대에 맞춰 신주쿠와 요츠야를 따라 걸으며, 장면마다 직접 찍은 대표 사진과 감상을 남긴 게시물입니다.',
    author: {
      userId: 'yuki_tanaka',
      name: 'Yuki_Tanaka',
      avatarLabel: 'YT',
    },
    createdAt: '2026-02-06T15:30:00+09:00',
    publishedDateLabel: '2026.02.06',
    publishedTimeLabel: '15:30',
    tagNames: ['도쿄', '너의이름은', '성지순례', '황혼'],
    routeTitle: '도쿄 황혼 교차로 루트',
    locationSummary: '신주쿠, 요츠야, 스가 신사',
    stats: {
      views: 2310,
      likes: 540,
    },
    guideText:
      '해 질 무렵 30분 전쯤 도착하면 장면과 비슷한 채도를 만들기 좋습니다. 계단 쪽은 좁기 때문에 삼각대보다는 손각대를 추천합니다.',
    audioRecommendations: [
      { id: 'ost-1', title: 'Sparkle - RADWIMPS', note: '계단 장면 전후 감정선과 잘 맞습니다.' },
      { id: 'ost-2', title: 'Nandemonaiya - RADWIMPS', note: '해가 완전히 진 뒤 여운을 길게 끌어줍니다.' },
      { id: 'ost-3', title: 'Zenzenzense - RADWIMPS', note: '신주쿠 이동 구간에서 템포가 잘 맞습니다.' },
    ],
    entries: [
      createEntry({
        id: 'entry-1',
        title: '스가 신사 계단',
        artworkTitle: '너의 이름은 - 재회 직전',
        address: '5-6 Sugacho, Shinjuku City, Tokyo',
        lat: 35.6887,
        lng: 139.7218,
        referenceImageUrl:
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
        userImageUrl:
          'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80',
        sceneNote:
          '이 장면이 정말 좋았습니다. 실제 계단은 생각보다 훨씬 짧았지만, 뒤돌아보는 시선을 따라가니 작중 감정선이 그대로 느껴졌습니다. 이때는 Sparkle을 들으면서 올라갔는데, 마지막 계단에서 멈췄을 때 훨씬 몰입감이 컸습니다.',
        soundtrack: 'Sparkle - RADWIMPS',
        visitTimeLabel: '17:42',
        moodTags: ['황혼', '재회', 'OST'],
      }),
      createEntry({
        id: 'entry-2',
        title: '신주쿠 교차로',
        artworkTitle: '너의 이름은 - 도쿄 야경 컷',
        address: 'Shinjuku Crossing, Tokyo',
        lat: 35.6903,
        lng: 139.7006,
        referenceImageUrl:
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
        userImageUrl:
          'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
        sceneNote:
          '네온 간판의 채도는 애니메이션이 과장한 줄 알았는데 실제로도 충분히 화려했습니다. 다만 현장 소음이 커서, Nandemonaiya를 노이즈캔슬링으로 들으니 오히려 장면에 집중하기 좋았습니다. 사람 흐름이 많아서 정면 컷보다 살짝 비켜난 위치에서 찍는 게 안정적이었습니다.',
        soundtrack: 'Nandemonaiya - RADWIMPS',
        visitTimeLabel: '18:05',
        moodTags: ['야경', '네온', '도심'],
      }),
      createEntry({
        id: 'entry-3',
        title: '요츠야 역 주변 골목',
        artworkTitle: '너의 이름은 - 스쳐 지나가는 도쿄',
        address: 'Yotsuya, Shinjuku City, Tokyo',
        lat: 35.6869,
        lng: 139.7302,
        referenceImageUrl:
          'https://images.unsplash.com/photo-1526483360412-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
        userImageUrl:
          'https://images.unsplash.com/photo-1684419081530-d0dd7ed6921a?auto=format&fit=crop&w=1200&q=80',
        sceneNote:
          '이 구간은 화려한 장소보다 오히려 이동의 리듬이 중요한 곳이었습니다. 직접 걸어보니 배경으로 스쳐 지나가는 순간들이 왜 영화에서 중요하게 느껴졌는지 이해됐고, Zenzenzense를 들으면서 빠르게 걷는 편이 장면 느낌과 더 잘 맞았습니다.',
        soundtrack: 'Zenzenzense - RADWIMPS',
        visitTimeLabel: '18:24',
        moodTags: ['이동', '리듬', '도쿄'],
      }),
    ],
    relatedEntries: [
      {
        id: 'related-1',
        title: '스가 신사 계단',
        subtitle: '재회 직전 감정선',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'related-2',
        title: '신주쿠 교차로',
        subtitle: '네온 야경 비교',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'related-3',
        title: '요츠야 골목',
        subtitle: '이동 장면의 리듬',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1526483360412-f4dbaf036963?auto=format&fit=crop&w=600&q=80',
      },
    ],
    comments: [
      createComment({
        id: 'comment-1',
        author: 'mitsuha_fan',
        avatarLabel: 'MF',
        timeLabel: '2시간 전',
        content:
          '스가 신사 계단에서 어떤 방향으로 찍으셨는지 궁금해요. 저도 비슷한 구도로 남기고 싶은데 사람 피하는 시간이 따로 있었나요?',
      }),
      createComment({
        id: 'comment-2',
        author: 'tokyo_route_note',
        avatarLabel: 'TR',
        timeLabel: '1시간 전',
        content:
          'OST를 같이 적어둔 게 정말 좋네요. 다음에 갈 때 그대로 플레이리스트 따라가 보고 싶습니다.',
      }),
    ],
  },
  {
    id: '2',
    routeId: 315,
    title: '카마쿠라 건널목, 오전 8시/10시 중 언제가 촬영하기 좋을까요?',
    boardType: BOARD_TYPES.FREE,
    summary:
      '이번 주말에 카마쿠라 성지순례를 가는데, 같은 장소라도 시간대마다 난이도가 다르다고 해서 선배 유저분들 경험을 묻고 싶습니다.',
    author: {
      userId: 'sho_trip',
      name: 'Sho_Trip',
      avatarLabel: 'ST',
    },
    createdAt: '2026-01-28T10:12:00+09:00',
    publishedDateLabel: '2026.01.28',
    publishedTimeLabel: '10:12',
    tagNames: ['카마쿠라', '슬램덩크', '해안'],
    routeTitle: '카마쿠라 슬램덩크 루트',
    locationSummary: '건널목, 코시고에, 해안 도로',
    stats: {
      views: 1890,
      likes: 422,
    },
    guideText:
      '오전 9시 전후가 가장 한산하고 역광도 덜합니다. 해안선은 바람이 강해서 셔터를 조금 빠르게 두는 편이 좋습니다.',
    audioRecommendations: [
      { id: 'ost-4', title: '너에게로 가는 길', note: '해안 도로를 걸을 때 템포가 잘 맞습니다.' },
      { id: 'ost-5', title: '세상의 중심에서', note: '건널목 대기 시간에 여운이 좋습니다.' },
    ],
    entries: [
      createEntry({
        id: 'entry-21',
        title: '카마쿠라 고등학교 앞 건널목',
        artworkTitle: '슬램덩크 OP',
        address: '1 Chome-1 Koshigoe, Kamakura',
        lat: 35.3061,
        lng: 139.4868,
        referenceImageUrl:
          'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=1200&q=80',
        userImageUrl:
          'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
        sceneNote:
          '건널목이 열리기 직전의 긴장감이 생각보다 잘 살아 있습니다. 바닷바람 소리가 크게 들려서, 장면보다 훨씬 현실적인 느낌이 강했습니다.',
        soundtrack: '너에게로 가는 길',
        visitTimeLabel: '09:14',
        moodTags: ['건널목', '해안', '오전'],
      }),
    ],
    relatedEntries: [
      {
        id: 'related-21',
        title: '건널목 컷',
        subtitle: '바닷바람과 함께',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?auto=format&fit=crop&w=600&q=80',
      },
    ],
    comments: [
      createComment({
        id: 'comment-21',
        author: 'coast_line',
        avatarLabel: 'CL',
        timeLabel: '어제',
        content: '오전 시간대 정보가 정말 유용하네요. 다음 주에 그대로 따라가 보겠습니다.',
      }),
    ],
  },
  {
    id: '3',
    routeId: 108,
    title: '교토 센과 치히로 분위기 코스, 비 오는 날에도 괜찮을까요?',
    boardType: BOARD_TYPES.FREE,
    summary:
      '비 예보가 있어도 감성 컷을 건질 수 있는지, 우천 시 동선이나 추천 시간대를 공유하는 자유게시판 게시물입니다.',
    author: {
      userId: 'sakurafan',
      name: 'SakuraFan',
      avatarLabel: 'SF',
    },
    createdAt: '2026-01-19T13:05:00+09:00',
    publishedDateLabel: '2026.01.19',
    publishedTimeLabel: '13:05',
    tagNames: ['교토', '센과치히로', '분위기'],
    routeTitle: '교토 정적 산책 루트',
    locationSummary: '기온, 야사카, 마루야마',
    stats: {
      views: 1605,
      likes: 311,
    },
    guideText:
      '오후 늦게보다는 흐린 낮이 오히려 분위기를 잘 살려줍니다. 사람 없는 컷을 원하면 평일 오전을 추천합니다.',
    audioRecommendations: [
      { id: 'ost-6', title: "One Summer's Day", note: '정적인 골목 장면과 잘 어울립니다.' },
    ],
    entries: [
      createEntry({
        id: 'entry-31',
        title: '기온 골목 입구',
        artworkTitle: '센과 치히로의 행방불명 - 분위기 참고',
        address: 'Gionmachi, Kyoto',
        lat: 35.0037,
        lng: 135.7788,
        referenceImageUrl:
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
        userImageUrl:
          'https://images.unsplash.com/photo-1720782635607-d08f4b88fb25?auto=format&fit=crop&w=1200&q=80',
        sceneNote:
          '정확히 같은 장소라기보다, 공기와 빛의 온도가 작품과 닮아 있었습니다. 너무 화려하지 않은 골목이라 오히려 상상이 더 잘 됐습니다.',
        soundtrack: "One Summer's Day",
        visitTimeLabel: '11:40',
        moodTags: ['정적', '골목', '교토'],
      }),
    ],
    relatedEntries: [
      {
        id: 'related-31',
        title: '기온 골목',
        subtitle: '분위기 중심 기록',
        thumbnailUrl:
          'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=600&q=80',
      },
    ],
    comments: [
      createComment({
        id: 'comment-31',
        author: 'ghibli_note',
        avatarLabel: 'GN',
        timeLabel: '3일 전',
        content: '정확히 같은 장소가 아니라 분위기 중심으로 접근한 점이 오히려 좋네요.',
      }),
    ],
  },
];

// routeId가 null인 데이터만 커뮤니티(자유게시판) 목업으로 취급합니다.
const communityPostDetails = [
  {
    id: 'community-101',
    routeId: null,
    boardType: BOARD_TYPES.FREE,
    title: '도쿄 첫 성지순례 다녀왔어요. 동선 후기 공유합니다.',
    summary: '신주쿠-요츠야 위주로 천천히 걸었고, 초행이라면 오전보다 오후 시작이 훨씬 편했습니다.',
    content:
      '첫 방문이라 이동 시간이 가장 걱정됐는데, 실제로는 장소 사이 이동보다 대기 시간이 변수였습니다. 스팟 사이마다 15분 정도 여유를 두고 움직이니 꽤 안정적으로 소화할 수 있었어요. 초행이신 분들은 무리해서 스팟을 많이 넣기보다 2~3곳 집중 추천드립니다.',
    author: {
      userId: 'route_starter',
      name: 'RouteStarter',
      avatarLabel: 'RS',
    },
    createdAt: '2026-03-17T10:24:00+09:00',
    publishedDateLabel: '2026.03.17',
    publishedTimeLabel: '10:24',
    tagNames: ['도쿄', '초행', '후기'],
    stats: {
      views: 482,
      likes: 29,
    },
    comments: [
      createComment({
        id: 'community-101-c1',
        author: 'tokyo_note',
        avatarLabel: 'TN',
        timeLabel: '2시간 전',
        content: '여유 시간 15분 규칙 좋네요. 저도 그대로 적용해보겠습니다.',
      }),
    ],
  },
  {
    id: 'community-102',
    routeId: null,
    boardType: BOARD_TYPES.FREE,
    title: '카마쿠라 오전 촬영 팁 정리해봅니다',
    summary: '역광 피하려면 8시~8시 30분 사이가 제일 무난했고, 바람 대비가 중요했습니다.',
    content:
      '지난 주말 기준으로 9시가 넘으면 대기 인원이 체감상 확 늘었습니다. 건널목 촬영은 셔터를 너무 느리게 가져가면 실패 컷이 많아서, 초행이면 셔터 우선으로 먼저 안전하게 찍는 걸 추천합니다.',
    author: {
      userId: 'coast_memo',
      name: 'CoastMemo',
      avatarLabel: 'CM',
    },
    createdAt: '2026-03-16T08:10:00+09:00',
    publishedDateLabel: '2026.03.16',
    publishedTimeLabel: '08:10',
    tagNames: ['카마쿠라', '촬영팁'],
    stats: {
      views: 620,
      likes: 41,
    },
    comments: [
      createComment({
        id: 'community-102-c1',
        author: 'sunrise_trip',
        avatarLabel: 'ST',
        timeLabel: '어제',
        content: '시간대 정보가 실제로 가장 도움이 되네요. 감사합니다.',
      }),
    ],
  },
  {
    id: 'community-103',
    routeId: null,
    boardType: BOARD_TYPES.FREE,
    title: '교토 골목 루트는 비 오는 날이 오히려 좋았어요',
    summary: '사람이 적어서 천천히 보기 좋았고, 사진 톤도 오히려 분위기 있게 나왔습니다.',
    content:
      '비 오는 날 이동이 불편하긴 했지만, 메인 거리보다 골목 위주로 걷는 루트라면 만족도가 높았습니다. 우산 때문에 촬영이 불편할 수 있으니 손목 스트랩 있는 카메라나 가벼운 장비를 추천드립니다.',
    author: {
      userId: 'rain_kyoto',
      name: 'RainKyoto',
      avatarLabel: 'RK',
    },
    createdAt: '2026-03-15T19:48:00+09:00',
    publishedDateLabel: '2026.03.15',
    publishedTimeLabel: '19:48',
    tagNames: ['교토', '우천', '분위기'],
    stats: {
      views: 358,
      likes: 26,
    },
    comments: [],
  },
  {
    id: 'community-104',
    routeId: null,
    boardType: BOARD_TYPES.FREE,
    title: '처음 가는 분들을 위한 준비물 체크리스트',
    summary: '배터리/보조배터리/편한 신발은 필수, 일정은 절대 빡빡하게 잡지 않는 걸 추천합니다.',
    content:
      '하루 안에 많은 스팟을 넣으면 결국 사진도 기억도 애매해지더라고요. 스팟 수를 줄이고 체류 시간을 늘리는 방식이 더 만족도가 높았습니다. 특히 이동 간 휴식 장소를 미리 정해두면 체력 소모가 크게 줄어요.',
    author: {
      userId: 'first_trip_lab',
      name: 'FirstTripLab',
      avatarLabel: 'FL',
    },
    createdAt: '2026-03-14T14:05:00+09:00',
    publishedDateLabel: '2026.03.14',
    publishedTimeLabel: '14:05',
    tagNames: ['준비물', '초행', '팁'],
    stats: {
      views: 779,
      likes: 63,
    },
    comments: [
      createComment({
        id: 'community-104-c1',
        author: 'light_pack',
        avatarLabel: 'LP',
        timeLabel: '3일 전',
        content: '체류 시간을 늘리라는 조언이 정말 공감됩니다.',
      }),
    ],
  },
];

// 공통 데이터 소스는 하나로 두고, 화면별로 routeId 조건으로 분기합니다.
const allPostDetails = [...mockPostDetails, ...communityPostDetails];

// createdAt이 없는 데이터도 정렬 가능하도록 publishedDateLabel을 보조값으로 사용합니다.
const parseCreatedAt = (post) => {
  if (!post) return 0;
  if (post.createdAt) return new Date(post.createdAt).getTime();
  if (post.publishedDateLabel) {
    return new Date(`${post.publishedDateLabel.replaceAll('.', '-')}T00:00:00+09:00`).getTime();
  }
  return 0;
};

// 상세 데이터를 카드/목록 렌더링에 맞는 요약 모델로 변환합니다.
const createSummary = (post) => ({
  id: post.id,
  routeId: post.routeId ?? null,
  title: post.title,
  content: post.summary ?? post.content ?? '',
  userId: post.author?.name ?? post.author?.userId ?? '익명',
  viewCount: post.stats?.views ?? 0,
  likeCount: post.stats?.likes ?? 0,
  commentCount: post.comments?.length ?? 0,
  tagNames: post.tagNames ?? [],
  imageUrl: post.entries?.[0]?.userImageUrl ?? post.entries?.[0]?.referenceImageUrl ?? '',
  publishedAt: post.publishedDateLabel ?? '',
  boardType: post.boardType ?? BOARD_TYPES.FREE,
  category: post.routeId == null ? '커뮤니티' : '게시물',
});

// 최신/인기/조회 정렬 공통 함수
const sortSummaries = (summaries, sortBy = 'latest') => {
  const sorted = [...summaries];

  if (sortBy === 'popular') {
    return sorted.sort((a, b) => b.likeCount - a.likeCount);
  }
  if (sortBy === 'views') {
    return sorted.sort((a, b) => b.viewCount - a.viewCount);
  }
  return sorted.sort((a, b) => parseCreatedAt(getPostDetailById(b.id)) - parseCreatedAt(getPostDetailById(a.id)));
};

// 상세 조회 공통 헬퍼
const getPostDetailById = (postId) =>
  allPostDetails.find((post) => String(post.id) === String(postId)) ?? null;

// 검색어를 제목/본문/태그에 공통 적용합니다.
const filterBySearch = (summaries, search = '') => {
  const query = search.trim().toLowerCase();
  if (!query) return summaries;

  return summaries.filter((post) => {
    const inTitle = post.title.toLowerCase().includes(query);
    const inContent = post.content.toLowerCase().includes(query);
    const inTags = post.tagNames.some((tag) => String(tag).toLowerCase().includes(query));
    return inTitle || inContent || inTags;
  });
};

/**
 * routeId != null 인 "일반 게시물" 목록만 반환합니다.
 * /posts(게시물 검색) 화면이 이 함수를 사용합니다.
 */
export const getRoutePosts = ({ tags = [], sortBy = 'views', search = '' } = {}) => {
  const normalizedTags = tags.map((tag) => String(tag).trim()).filter(Boolean);
  const routeSummaries = allPostDetails
    .filter((post) => post.routeId != null)
    .map(createSummary);

  const withTagFilter =
    normalizedTags.length > 0
      ? routeSummaries.filter((post) => normalizedTags.every((tag) => post.tagNames.includes(tag)))
      : routeSummaries;

  return sortSummaries(filterBySearch(withTagFilter, search), sortBy);
};

/**
 * routeId == null 인 "커뮤니티 글" 목록만 반환합니다.
 * /community 및 홈 커뮤니티 미리보기의 원본 데이터입니다.
 */
export const getCommunityPosts = ({ search = '', sortBy = 'latest' } = {}) => {
  const communitySummaries = allPostDetails
    .filter((post) => post.routeId == null)
    .map(createSummary);

  return sortSummaries(filterBySearch(communitySummaries, search), sortBy);
};

// 홈 섹션에서 최신 N개만 보여줄 때 사용합니다.
export const getCommunityPreviewPosts = (limit = 4) =>
  getCommunityPosts({ sortBy: 'latest' }).slice(0, limit);

export const mockPostSummaries = getRoutePosts();

export const getMockPostDetail = (postId) => {
  const post = getPostDetailById(postId);
  // 상세 페이지 라우팅 보호: 커뮤니티 글은 일반 게시물 상세에서 제외
  if (!post || post.routeId == null) return null;
  return post;
};

export const getCommunityPostDetail = (postId) => {
  const post = getPostDetailById(postId);
  // 상세 페이지 라우팅 보호: 일반 route 게시글은 커뮤니티 상세에서 제외
  if (!post || post.routeId != null) return null;
  return post;
};

// 작성자 이름을 아바타 축약 라벨(최대 2글자)로 변환합니다.
const buildAvatarLabel = (name = '나') =>
  String(name)
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .slice(0, 2)
    .toUpperCase() || '나';

const formatDateLabel = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const formatTimeLabel = (date) => {
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minute}`;
};

/**
 * 커뮤니티 목업 글 생성 유틸
 * - 백엔드 연동 전 UI/플로우 점검용 함수
 * - routeId를 null로 고정해 커뮤니티 데이터 규칙을 유지
 */
export const createCommunityMockPost = ({ title, content, authorName = '나', authorId = 'me' }) => {
  const now = new Date();
  const id = `community-${Date.now()}`;
  const post = {
    id,
    routeId: null,
    boardType: BOARD_TYPES.FREE,
    title: title.trim(),
    summary: content.trim().slice(0, 120),
    content: content.trim(),
    author: {
      userId: authorId,
      name: authorName,
      avatarLabel: buildAvatarLabel(authorName),
    },
    createdAt: now.toISOString(),
    publishedDateLabel: formatDateLabel(now),
    publishedTimeLabel: formatTimeLabel(now),
    tagNames: [],
    stats: {
      views: 0,
      likes: 0,
    },
    comments: [],
  };

  communityPostDetails.unshift(post);
  return post;
};
