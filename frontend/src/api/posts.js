import { FetchClient } from './FetchClient';

/**
 * 게시글 목록 조회 시 사용할 query 규약입니다.
 * 현재 백엔드는 전체 목록 조회가 중심이지만,
 * 추후 검색/정렬/페이지네이션이 붙어도 함수 시그니처를 다시 바꾸지 않기 위해
 * params 객체 하나로 입력 형태를 먼저 고정합니다.
 *
 * @typedef {Object} PostQueryParams
 * @property {string} [keyword] 제목/본문 검색어
 * @property {string} [tag] 태그명
 * @property {string} [status] 게시글 상태
 * @property {'latest' | 'popular' | 'views'} [sortBy] 정렬 기준
 * @property {number} [page] 페이지 번호
 * @property {number} [size] 페이지 크기
 */

/**
 * 백엔드 `/api/v1/posts`가 내려주는 원본 DTO 형태입니다.
 * 프론트는 이 DTO를 직접 화면에 뿌리지 않고,
 * 아래 normalize 함수를 통해 카드 화면용 모델로 한 번 변환합니다.
 *
 * @typedef {Object} PostResponseDto
 * @property {number} postId
 * @property {string} userId
 * @property {number} routeId
 * @property {string} title
 * @property {string} content
 * @property {string} createdAt
 * @property {string} status
 * @property {number} viewCount
 * @property {number} likeCount
 * @property {string} updateAt
 * @property {Array<{ imageUrl?: string, sortOrder?: number }>} [images]
 */

/**
 * 카드 UI가 실제로 사용하는 화면 전용 모델입니다.
 * 팀원들은 페이지 컴포넌트에서 이 구조만 믿고 사용하면 됩니다.
 *
 * @typedef {Object} PostCardModel
 * @property {string} id 카드 key로 사용하는 게시글 ID
 * @property {string} title 카드 제목
 * @property {string} content 카드 본문 미리보기
 * @property {string} thumbnail 대표 이미지 URL
 * @property {string[]} tags 태그 칩용 배열
 * @property {string} author 작성자 표시명
 * @property {number} viewCount 조회수
 * @property {number} likeCount 좋아요 수
 * @property {number} commentCount 댓글 수
 * @property {string} createdAt 작성일시
 * @property {string} status 게시글 상태
 */

/**
 * params 객체를 query string으로 바꿉니다.
 * 값이 없는 항목은 URL에 붙이지 않아,
 * 추후 필터 조건이 늘어나도 요청 형식을 일관되게 유지할 수 있습니다.
 *
 * @param {PostQueryParams} params
 * @returns {string}
 */
const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * 게시글 목록을 조회합니다.
 * 페이지 컴포넌트는 이 함수만 호출하고,
 * 실제 fetch 동작과 query string 조합은 API 레이어에 숨깁니다.
 *
 * @param {PostQueryParams} [params]
 * @returns {Promise<PostResponseDto[]>}
 */
export const getPostsAPI = (params = {}) =>
  FetchClient(`/api/v1/posts${buildQueryString(params)}`, {
    method: 'GET',
  });

/**
 * 백엔드 DTO를 PostCard가 바로 사용할 수 있는 형태로 변환합니다.
 * 백엔드에 아직 없는 필드(tags, commentCount)는 fallback을 두어
 * 화면이 깨지지 않게 만들고, 추후 DTO가 확장되면 여기만 수정하면 됩니다.
 *
 * @param {PostResponseDto} post
 * @returns {PostCardModel}
 */
export const normalizePostResponse = (post) => ({
  id: String(post.postId ?? crypto.randomUUID()),
  title: post.title ?? '제목 없음',
  content: post.content ?? '등록된 게시글 내용이 없습니다.',
  thumbnail: post.images?.[0]?.imageUrl ?? '',
  tags: Array.isArray(post.tags) ? post.tags : [],
  author: post.userId ?? '알 수 없는 사용자',
  viewCount: Number(post.viewCount ?? 0),
  likeCount: Number(post.likeCount ?? 0),
  commentCount: Number(post.commentCount ?? 0),
  createdAt: post.createdAt ?? new Date(0).toISOString(),
  status: post.status ?? 'PUBLIC',
});

/**
 * 목록 응답 전체를 한 번에 화면 모델 배열로 변환합니다.
 * 배열이 아닌 값이 와도 빈 배열로 안전 처리해,
 * 페이지 쪽 예외 처리를 단순하게 유지합니다.
 *
 * @param {PostResponseDto[] | unknown} response
 * @returns {PostCardModel[]}
 */
export const normalizePostsResponse = (response) =>
  Array.isArray(response) ? response.map(normalizePostResponse) : [];
