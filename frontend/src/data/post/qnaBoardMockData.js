import { mockPostSummaries } from '@/data/post/postMockData';

const qnaMetaByPostId = {
  '1': {
    category: '질문',
    title: '너의 이름은 도쿄 루트, 황혼 시간대는 몇 시에 맞추는 게 좋을까요?',
    excerpt:
      '다음 주에 도쿄 성지순례를 갈 예정입니다. 스가 신사 계단과 신주쿠 교차로를 같은 날 도는 경우, 일몰 기준으로 어느 순서가 가장 자연스러운지 조언 부탁드립니다.',
    publishedAt: '2시간 전',
  },
  '2': {
    category: '답변완료',
    title: '카마쿠라 건널목 촬영할 때 주말 혼잡도는 어느 정도인가요?',
    excerpt:
      '슬램덩크 건널목 컷을 찍으려는데 토요일 오전 9시 도착이면 촬영이 가능한지 궁금합니다. 최근 다녀오신 분들의 동선 팁이나 대기 시간 정보가 있으면 공유 부탁드립니다.',
    publishedAt: '5시간 전',
  },
  '3': {
    category: '질문',
    title: '교토 분위기 위주 루트, 비 오는 날에도 괜찮을까요?',
    excerpt:
      '센과 치히로 감성으로 기온 주변을 걷는 일정을 생각 중입니다. 우천 시에도 분위기 있는 포인트가 유지되는지, 우산 들고 걷기 좋은 구간이 있는지 알고 싶습니다.',
    publishedAt: '1일 전',
  },
};

export const qnaBoardPosts = mockPostSummaries.map((post) => {
  const meta = qnaMetaByPostId[String(post.id)] ?? {};

  return {
    id: String(post.id),
    detailPostId: String(post.id),
    category: meta.category ?? '질문',
    title: meta.title ?? post.title,
    excerpt: meta.excerpt ?? post.content,
    author: post.userId,
    publishedAt: meta.publishedAt ?? post.publishedAt,
    tags: post.tags,
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    imageUrl: post.imageUrl,
  };
});

export const communityPreviewPosts = qnaBoardPosts.slice(0, 3);
