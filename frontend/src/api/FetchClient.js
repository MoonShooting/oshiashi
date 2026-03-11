const BASE_URL = 'http://localhost:9933';

// 인증/일반 API에서 공통으로 사용하는 fetch 래퍼입니다.
// 토큰 주입, 기본 헤더 설정, 응답 타입 판별을 한 곳에서 처리합니다.
export const FetchClient = async (endpoint, options = {}) => {
  const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || '요청 처리에 실패했습니다.');
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};
