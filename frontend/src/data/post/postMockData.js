const createComment = (comment) => ({
  id: comment.id,
  author: comment.author,
  avatarLabel: comment.avatarLabel,
  timeLabel: comment.timeLabel,
  content: comment.content,
});

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
    title: '작중 시간대 그대로 걸은 너의 이름은 하루 코스',
    summary:
      '황혼 시간대에 맞춰 신주쿠와 요츠야를 따라 걸으며, 장면마다 직접 찍은 대표 사진과 감상을 남긴 게시물입니다.',
    author: {
      userId: 'yuki_tanaka',
      name: 'Yuki_Tanaka',
      avatarLabel: 'YT',
    },
    publishedDateLabel: '2026.02.06',
    publishedTimeLabel: '15:30',
    tags: ['도쿄', '너의이름은', '성지순례', '황혼'],
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
    title: '카마쿠라 해안선에서 슬램덩크 컷 따라찍기',
    summary:
      '카마쿠라 건널목과 해안 도로를 중심으로 대표 장면을 따라 걸으며 남긴 짧은 기록입니다.',
    author: {
      userId: 'sho_trip',
      name: 'Sho_Trip',
      avatarLabel: 'ST',
    },
    publishedDateLabel: '2026.01.28',
    publishedTimeLabel: '10:12',
    tags: ['카마쿠라', '슬램덩크', '해안'],
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
    title: '교토에서 센과 치히로 분위기만 골라 걷기',
    summary:
      '붐비는 스팟보다 분위기가 살아 있는 골목과 계단 위주로 골라서 남긴 교토 산책 게시물입니다.',
    author: {
      userId: 'sakurafan',
      name: 'SakuraFan',
      avatarLabel: 'SF',
    },
    publishedDateLabel: '2026.01.19',
    publishedTimeLabel: '13:05',
    tags: ['교토', '센과치히로', '분위기'],
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

export const mockPostSummaries = mockPostDetails.map((post) => ({
  id: post.id,
  title: post.title,
  content: post.summary,
  userId: post.author.name,
  viewCount: post.stats.views,
  likeCount: post.stats.likes,
  commentCount: post.comments.length,
  tags: post.tags,
  imageUrl: post.entries[0]?.userImageUrl ?? post.entries[0]?.referenceImageUrl ?? '',
  publishedAt: post.publishedDateLabel,
}));

export const getMockPostDetail = (postId) =>
  mockPostDetails.find((post) => String(post.id) === String(postId)) ?? null;
