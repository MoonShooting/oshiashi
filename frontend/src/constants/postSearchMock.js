export const DEFAULT_SELECTED_TAGS = ['너의이름은', '도쿄', '애니'];

const TAG_POOL = [
  '너의이름은',
  '도쿄',
  '애니',
  '카마쿠라',
  '교토',
  '영화',
  '드라마',
  '스즈메의문단속',
  '에반게리온',
  '하코네',
];

const TITLES = [
  '카마쿠라 성지순례 후기',
  '너의이름은 도쿄 루트 1일 코스',
  '교토 감성 성지 정리',
  '에반게리온 하코네 완전정복',
  '스즈메의문단속 배경지 탐방기',
  '애니 덕후를 위한 주말 원정 코스',
];

const AUTHORS = ['도쿄러버', '애니순례자', '교토덕후', '카마쿠라냥', '성지러', '루트메이커'];

const THUMBNAILS = [
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80',
];

export const SORTERS = {
  latest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  popular: (a, b) => b.likeCount - a.likeCount,
  views: (a, b) => b.viewCount - a.viewCount,
};

export const buildMockPosts = () => {
  return Array.from({ length: 36 }).map((_, index) => {
    const baseTags = [
      TAG_POOL[index % TAG_POOL.length],
      TAG_POOL[(index + 1) % TAG_POOL.length],
      TAG_POOL[(index + 2) % TAG_POOL.length],
    ];

    return {
      id: `post-${index + 1}`,
      title: TITLES[index % TITLES.length],
      content:
        '현지 이동 동선, 촬영 포인트, 시간대별 추천 장소를 정리한 성지순례 게시글입니다. 직접 다녀온 경험을 기반으로 작성했습니다.',
      thumbnail: THUMBNAILS[index % THUMBNAILS.length],
      tags: [...new Set(baseTags)],
      author: AUTHORS[index % AUTHORS.length],
      viewCount: 420 + index * 17,
      likeCount: 32 + index * 3,
      commentCount: 8 + (index % 15),
      createdAt: new Date(Date.now() - index * 1000 * 60 * 60 * 7).toISOString(),
    };
  });
};
