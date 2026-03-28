/*
[tokenUtils - JWT 토큰 유틸리티]
- localStorage/sessionStorage에 저장된 accessToken에서 userId를 복구합니다.
- routePostApi, communityApi 등에서 중복되던 토큰 파싱 로직을 이 한 곳으로 통합합니다.
*/

const getStoredAccessToken = () =>
  localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

/**
 * userId가 비어 있을 때 저장된 JWT에서 userId(sub)를 복구합니다.
 * Zustand user가 아직 hydrate되지 않은 시점에도 API 호출이 가능하도록 하는 안전장치입니다.
 */
export const resolveUserIdForRouteQuery = (userId) => {
  if (typeof userId === 'string' && userId.trim()) {
    return userId.trim();
  }

  const rawToken = getStoredAccessToken();
  if (!rawToken) return '';

  const token = rawToken.replace(/^Bearer\s+/i, '').trim();
  const payloadPart = token.split('.')[1];
  if (!payloadPart) return '';

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    const tokenUserId = payload?.userId ?? payload?.sub ?? payload?.username ?? '';
    return typeof tokenUserId === 'string' ? tokenUserId.trim() : '';
  } catch {
    return '';
  }
};
