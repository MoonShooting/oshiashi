import { FetchClient } from './FetchClient.js';
import { extractArrayPayload } from './postApiShared.js';

// 선택된 작품 태그로 공개 게시글 조회 (최신순 4개)
// 지도 우측 패널에서 사용 (Tag → Artwork → Spot 흐름)
export const getPublicPostsByTag = async (tagTitle) => {
  if (!tagTitle) return [];

  // tags 파라미터로 검색, 서버가 최신순 정렬 후 내려줌
  const params = new URLSearchParams({ tags: tagTitle, sort: 'latest' });
  const raw = await FetchClient(`/api/v1/posts?${params.toString()}`, { method: 'GET' });
  const items = extractArrayPayload(raw);

  // status 필드가 있으면 PUBLIC만, 없으면(필드 자체가 없을 때) 전체를 공개로 간주
  return items
    .filter((p) => !p.status || p.status === 'PUBLIC')
    .slice(0, 4);
};
