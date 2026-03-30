import { FetchClient } from './FetchClient.js';
import { extractArrayPayload } from './postApiShared.js';

// 선택된 작품 태그로 공개 게시글 조회 (최신순 4개)
// 지도 우측 패널에서 사용 (Tag → Artwork → Spot 흐름)
export const getPublicPostsByTag = async (tagTitle) => {
  if (!tagTitle) return [];

  // GET /api/v1/posts        → routeIdIsNull=false (루트 있는 게시물만)
  // GET /api/v1/posts/community → routeIdIsNull=true  (커뮤니티 게시물만)
  // 맵 사이드바는 두 유형 모두 표시해야 하므로 병렬 호출 후 병합
  const params = new URLSearchParams({ tags: tagTitle, sort: 'latest', page: '0', size: '4' });
  const url = `/api/v1/posts?${params.toString()}`;
  const communityUrl = `/api/v1/posts/community?${params.toString()}`;

  const [routeResult, communityResult] = await Promise.allSettled([
    FetchClient(url, { method: 'GET' }),
    FetchClient(communityUrl, { method: 'GET' }),
  ]);

  const routePosts = routeResult.status === 'fulfilled' ? extractArrayPayload(routeResult.value) : [];
  const communityPosts = communityResult.status === 'fulfilled' ? extractArrayPayload(communityResult.value) : [];

  return [...routePosts, ...communityPosts]
    .filter((p) => !p.status || p.status.toUpperCase() === 'PUBLIC')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);
};
