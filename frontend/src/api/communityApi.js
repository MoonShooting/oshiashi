import { FetchClient } from '@/api/FetchClient';

// 커뮤니티 목록/홈 미리보기는 이 이벤트를 듣고 즉시 재조회합니다.
const COMMUNITY_POSTS_UPDATED_EVENT = 'community-posts-changed';

const emitCommunityPostsUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMMUNITY_POSTS_UPDATED_EVENT));
  }
};

/**
 * 날짜 문자열을 "안전한 Date 객체"로 바꿔주는 공통 유틸입니다.
 *
 * 왜 필요한가?
 * 1) API 응답의 createdAt이 비어있거나(undefined/null/빈 문자열) 형식이 잘못될 수 있습니다.
 * 2) new Date('잘못된 값')은 예외를 던지지 않고 Invalid Date 객체를 반환합니다.
 * 3) Invalid Date는 객체라서 truthy이기 때문에, 단순 if(parsed) 체크로는 걸러지지 않습니다.
 *
 * 동작 규칙:
 * - 유효한 날짜면 Date 객체 반환
 * - 비어있거나 파싱 불가능하면 null 반환
 *
 * 이렇게 null로 통일해 두면,
 * formatDateLabel / formatTimeLabel / formatRelativeTimeLabel에서
 * "if (!date) return '-'" 형태로 안전하게 후처리할 수 있습니다.
 */
const toDateOrNull = (value) => {
  // 값 자체가 없으면(Date 파싱 시도 자체가 의미 없으므로) 즉시 null 반환
  if (!value) return null;

  const parsed = new Date(value);

  // getTime()이 NaN이면 Invalid Date라는 뜻이므로 null로 표준화
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// YYYY.MM.DD 형식(예: 2026.03.18)으로 안전하게 변환합니다.
const formatDateLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '-';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// HH:mm 형식(예: 14:08)으로 안전하게 변환합니다.
const formatTimeLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '-';
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minute}`;
};

// 상세/댓글에서 쓰는 상대시간 라벨을 계산합니다.
const formatRelativeTimeLabel = (isoString) => {
  if (!isoString) return '';

  const target = toDateOrNull(isoString);
  if (!target) return '';
  const now = new Date();
  const diffMs = now.getTime() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))}분 전`;
  }
  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}시간 전`;
  }
  if (diffMs < day * 7) {
    return `${Math.floor(diffMs / day)}일 전`;
  }

  return formatDateLabel(isoString);
};

/**
 * 사용자 이름으로부터 댓글/게시글 아바타에 표시할 "짧은 라벨(최대 2글자)"을 만듭니다.
 *
 * 왜 필요한가?
 * - 프로필 이미지가 없을 때도 원형 아바타 안에 식별 가능한 텍스트를 보여주기 위해서입니다.
 * - 입력 이름이 비어있거나 특수문자만 들어온 경우 UI가 깨지지 않도록 fallback이 필요합니다.
 *
 * 처리 단계:
 * 1) String(name): null/number 등 어떤 값이 와도 문자열로 통일
 * 2) replace(/[^a-zA-Z0-9가-힣]/g, ''):
 *    - 영문/숫자/한글만 남기고 공백, 특수문자(_,-,!,이모지 등)는 제거
 *    - 아바타 라벨에 노이즈 문자가 들어가는 것을 방지
 * 3) slice(0, 2): 라벨 길이를 최대 2글자로 제한해 레이아웃 일관성 유지
 * 4) toUpperCase(): 영문 라벨은 대문자로 통일해 가독성 확보
 * 5) || '나': 최종 문자열이 비면 기본 라벨 '나'로 대체
 */
const buildAvatarLabel = (name = '나') =>
  String(name)
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .slice(0, 2)
    .toUpperCase() || '나';

// 백엔드 목록 응답이 배열일 수도, 페이지 객체(content/data)일 수도 있어 공통으로 풀어냅니다.
const extractArrayPayload = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

// postId/id 어떤 키로 오더라도 프론트는 문자열 id 하나로 통일합니다.
const resolvePostId = (postResponse) => String(postResponse?.postId ?? postResponse?.id ?? '');

// routeId 직접 필드/route 객체 형태 모두 허용해 커뮤니티 여부를 판별합니다.
const resolveRouteId = (postResponse) => {
  if (!postResponse) return null;
  if (postResponse.routeId != null) return postResponse.routeId;
  if (postResponse.route?.routeId != null) return postResponse.route.routeId;
  if (postResponse.route?.id != null) return postResponse.route.id;
  return null;
};

const normalizeComment = (comment) => {
  const authorName = comment.nickname ?? comment.userName ?? comment.userId ?? '익명';

  return {
    id: String(comment.commentId ?? comment.id),
    author: authorName,
    authorId: comment.userId ?? null,
    avatarLabel: buildAvatarLabel(authorName),
    timeLabel: formatRelativeTimeLabel(comment.createdAt),
    createdAt: comment.createdAt,
    content: comment.content ?? '',
  };
};

// 백엔드 DTO를 화면에서 바로 쓰는 커뮤니티 상세 ViewModel로 정규화합니다.
const toCommunityDetail = (postResponse, comments = []) => {
  if (!postResponse) return null;

  const createdAt = postResponse.createdAt ?? new Date().toISOString();
  const authorId = postResponse.userId ?? 'anonymous';
  const authorName = postResponse.userNickname ?? postResponse.userName ?? authorId;
  const routeId = resolveRouteId(postResponse);
  const normalizedComments = comments.map(normalizeComment);

  return {
    id: resolvePostId(postResponse),
    routeId,
    boardType: 'FREE',
    title: postResponse.title ?? '',
    summary: (postResponse.content ?? '').slice(0, 120),
    content: postResponse.content ?? '',
    author: {
      userId: authorId,
      name: authorName,
      avatarLabel: buildAvatarLabel(authorName),
    },
    createdAt,
    publishedDateLabel: formatDateLabel(createdAt),
    publishedTimeLabel: formatTimeLabel(createdAt),
    tags: postResponse.tags ?? [],
    stats: {
      views: Number(postResponse.viewCount ?? 0),
      likes: Number(postResponse.likeCount ?? 0),
    },
    commentCount: Number(postResponse.commentCount ?? normalizedComments.length ?? 0),
    comments: normalizedComments,
  };
};

// 상세 ViewModel을 목록 카드용 요약 모델로 변환합니다.
const toSummary = (detail) => ({
  id: detail.id,
  routeId: null,
  title: detail.title,
  content: detail.summary ?? detail.content,
  userId: detail.author?.name ?? detail.author?.userId ?? '익명',
  viewCount: detail.stats?.views ?? 0,
  likeCount: detail.stats?.likes ?? 0,
  commentCount: detail.commentCount ?? detail.comments?.length ?? 0,
  tags: detail.tags ?? [],
  imageUrl: '',
  publishedAt: detail.publishedDateLabel ?? '',
  boardType: detail.boardType ?? 'FREE',
  category: '커뮤니티',
  createdAt: detail.createdAt,
});

/**
 * 커뮤니티 목록 조회 API 어댑터
 *
 * @param {Object} params
 * @param {string} params.search - 제목/내용/태그 검색어
 * @param {'latest'|'popular'|'views'} params.sortBy - 정렬 기준
 * @param {number} params.limit - 홈 미리보기처럼 상위 N건만 필요할 때 사용
 * @returns {Promise<Array>} PostCard 렌더링용 요약 목록
 */
export const fetchCommunityPosts = async ({ search = '', sortBy = 'latest', limit } = {}) => {
  // 커뮤니티는 routeId == null 조건이 핵심 규칙입니다.
  const params = new URLSearchParams();
  params.set('routeIdIsNull', 'true');
  params.set('sort', sortBy);

  if (search.trim()) {
    params.set('search', search.trim());
  }

  const response = await FetchClient(`/api/v1/posts?${params.toString()}`);
  const mapped = extractArrayPayload(response)
    .map((item) => toCommunityDetail(item, []))
    .filter((item) => item && item.routeId == null && item.id)
    .map(toSummary);

  if (typeof limit === 'number') {
    return mapped.slice(0, Math.max(0, limit));
  }

  return mapped;
};

/**
 * 커뮤니티 게시글 상세 + 댓글 조회
 *
 * 동작 순서:
 * 1) 게시글 상세 조회
 * 2) routeId가 null인지 확인(커뮤니티 글 판별)
 * 3) 댓글 목록 조회
 * 4) 화면용 상세 ViewModel로 정규화
 *
 * @returns {Promise<Object|null>} 커뮤니티 글이면 상세 객체, 아니면 null
 */
export const fetchCommunityPostById = async (postId) => {
  const response = await FetchClient(`/api/v1/posts/${postId}`);

  // 잘못된 URL로 route 게시글에 접근해도 커뮤니티 상세에서는 노출하지 않습니다.
  if (resolveRouteId(response) != null) {
    return null;
  }

  const rawComments = await FetchClient(`/api/v1/posts/${postId}/comments`);
  const comments = extractArrayPayload(rawComments);

  return toCommunityDetail(response, comments);
};

/**
 * 커뮤니티 글 생성
 *
 * 핵심: routeId를 null로 고정해 "일반 route 게시글"이 아니라
 * "커뮤니티 자유게시판 글"로 저장되도록 백엔드에 의도를 전달합니다.
 */
export const createCommunityPost = async ({ title, content }) => {
  // 커뮤니티 글임을 명시하기 위해 routeId: null을 고정 전송합니다.
  const response = await FetchClient('/api/v1/posts', {
    method: 'POST',
    body: JSON.stringify({
      title,
      content,
      routeId: null,
    }),
  });

  emitCommunityPostsUpdated();
  return toCommunityDetail(response, []);
};

/**
 * 커뮤니티 글 수정
 *
 * 왜 수정 후 재조회하나?
 * - PATCH 응답이 단순 성공 메시지일 수 있고
 * - 백엔드에서 가공된 최신 필드(작성자/통계/시간 형식 등)를 다시 받아와
 *   화면 상태를 서버 기준으로 동기화하기 위해서입니다.
 */
export const updateCommunityPost = async ({ postId, title, content }) => {
  // 1) 제목/내용만 부분 수정(PATCH)
  await FetchClient(`/api/v1/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify({ title, content }),
  });

  // 2) 수정 직후 최신 상세를 재조회해 화면 모델을 최신화
  const updated = await fetchCommunityPostById(postId);

  // 3) 목록/미리보기 동기화를 위해 전역 업데이트 이벤트 발행
  emitCommunityPostsUpdated();
  return updated;
};

/**
 * 커뮤니티 글 삭제
 *
 * 반환 데이터가 필요 없기 때문에 삭제 성공만 확인하고,
 * 목록/홈 미리보기 갱신을 위해 이벤트만 발행합니다.
 */
export const deleteCommunityPost = async ({ postId }) => {
  await FetchClient(`/api/v1/posts/${postId}`, {
    method: 'DELETE',
  });

  emitCommunityPostsUpdated();
};

/**
 * 댓글 생성
 *
 * 댓글 생성 API는 보통 생성된 댓글 1건만 돌려주거나 메시지만 주므로,
 * 상세 전체를 재조회해 댓글 수/정렬/상대시간까지 일관된 상태로 맞춥니다.
 */
export const createCommunityComment = async ({ postId, content }) => {
  await FetchClient(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

/**
 * 댓글 수정
 *
 * 1) 댓글 본문 수정 요청
 * 2) 게시글 상세 재조회(댓글 목록 최신화)
 * 3) 목록/미리보기 갱신 이벤트 발행
 */
export const updateCommunityComment = async ({ postId, commentId, content }) => {
  await FetchClient(`/api/v1/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });

  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

/**
 * 댓글 삭제
 *
 * 삭제 후에도 현재 페이지의 댓글 목록/개수를 즉시 맞추기 위해
 * 상세 재조회 + 업데이트 이벤트 발행 패턴을 동일하게 유지합니다.
 */
export const deleteCommunityComment = async ({ postId, commentId }) => {
  await FetchClient(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
  });

  const refreshed = await fetchCommunityPostById(postId);
  emitCommunityPostsUpdated();
  return refreshed;
};

// 외부 컴포넌트(useEffect)에서 동일 이벤트명을 안전하게 재사용하도록 export
export const communityPostsUpdatedEvent = COMMUNITY_POSTS_UPDATED_EVENT;
