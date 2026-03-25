const normalizeTagName = (value) => String(value ?? '').replace(/^#/, '').trim();

export const buildPostTagSearchUrl = (tagName) => {
  const normalizedTagName = normalizeTagName(tagName);
  if (!normalizedTagName) {
    throw new Error('게시글 검색에 사용할 작품 태그를 확인하지 못했습니다.');
  }

  // 게시글 검색 페이지의 상태는 URL query(tags)가 단일 소스이므로,
  // 화면마다 문자열 조립 규칙이 달라지지 않도록 URL 생성도 공통 유틸로 고정합니다.
  const next = new URLSearchParams();
  next.set('tags', normalizedTagName);
  return `/posts?${next.toString()}`;
};

export const navigateToPostTagSearch = (navigate, tagName) => {
  // navigate를 직접 쓰는 페이지가 많아질수록
  // "/posts?tags=..." 조립 규칙이 흩어지기 쉽습니다.
  // 그래서 최종 이동도 이 유틸을 통해 수행하게 합니다.
  navigate(buildPostTagSearchUrl(tagName));
};
