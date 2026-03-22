/*
[postApiShared]
- routePostApi / communityApi가 공통으로 사용하는 정규화 유틸 모음
- 목적: 중복 코드 축소 + 날짜/배열/북마크 처리 규칙 일관화
*/

// 백엔드 응답이 배열/페이지(content)/래핑(data/result) 중 어떤 형태로 와도 배열로 통일합니다.
export const extractArrayPayload = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

export const toDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDateLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '-';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export const formatTimeLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '-';
  const hour = `${date.getHours()}`.padStart(2, '0');
  const minute = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minute}`;
};

export const formatRelativeTimeLabel = (isoString) => {
  const date = toDateOrNull(isoString);
  if (!date) return '';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))}분 전`;
  }

  if (diffMs < day) {
    return `${Math.max(1, Math.floor(diffMs / hour))}시간 전`;
  }

  if (diffMs < day * 7) {
    return `${Math.max(1, Math.floor(diffMs / day))}일 전`;
  }

  return formatDateLabel(isoString);
};

export const buildAvatarLabel = (name = '나') =>
  String(name)
    .replace(/[^a-zA-Z0-9가-힣]/g, '')
    .slice(0, 2)
    .toUpperCase() || '나';

export const appendUserIdQuery = (endpoint, userId) => {
  if (!userId) return endpoint;
  const delimiter = endpoint.includes('?') ? '&' : '?';
  return `${endpoint}${delimiter}userId=${encodeURIComponent(userId)}`;
};

export const normalizeTagNames = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().replace(/^#/, ''))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim().replace(/^#/, ''))
      .filter(Boolean);
  }

  return [];
};

export const normalizeBookmark = (bookmark) => ({
  bookmarkId: String(bookmark?.bookmarkId ?? bookmark?.id ?? ''),
  bookmarkName: bookmark?.bookmarkName ?? '',
  postId: String(bookmark?.postId ?? ''),
});

// 북마크 목록 endpoint가 환경마다 다를 수 있어 후보 endpoint 순서대로 시도합니다.
export const fetchBookmarksWithFallback = async ({ fetchJson, userId } = {}) => {
  const endpoints = [
    '/api/v1/user/myBookmarks',
    userId ? appendUserIdQuery('/api/v1/user/bookmarks', userId) : null,
  ].filter(Boolean);

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetchJson(endpoint);
      return extractArrayPayload(response);
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
};
