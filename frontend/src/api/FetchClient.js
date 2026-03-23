/* 
[공통 함수로 FetchClient 만든 이유]
- 자동 토큰 주입: 로그인 후 accessToken을 일일이 헤더에 넣을 필요가 없습니다. (자동 처리)
- 똑똑한 응답 변환: 백엔드가 객체(JSON)를 주면 알아서 자바스크립트 객체로, 문자열을 주면 텍스트로 바꿔줍니다.
- 에러 조기 발견: 서버 에러(404, 500 등) 발생 시 명확한 에러 메시지를 던져줍니다.
- 코드 단축: 반복되는 BASE_URL이나 headers 설정을 생략할 수 있어 코드가 깔끔해집니다.
*/
const BASE_URL = 'http://localhost:9933';

const getAccessToken = () => localStorage.getItem('accessToken') ?? sessionStorage.getItem('accessToken');

// 요청 헤더 공통 조립:
// - Authorization 자동 주입
// - multipart인 경우 Content-Type 제거(브라우저 boundary 자동 처리)
const buildHeaders = (headers = {}, { isMultipart = false } = {}) => {
  const token = getAccessToken();
  const normalized = {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // multipart/form-data는 브라우저가 boundary를 자동으로 설정해야 하므로
  // Content-Type을 명시적으로 넣으면 안 됩니다.
  if (isMultipart) {
    delete normalized['Content-Type'];
  }

  return normalized;
};

const parseResponseBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  /* 
  [데이터 타입 자동 변환 로직]
  Java Spring는 객체(DTO)를 보낼 때
  '이건 JSON 데이터야'라고 말해주며(Content-Type: application/json) 보냅니다.
   */
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    // 백엔드가 객체를 보냈다면: 자바스크립트 객체로 변환해서 리턴
    // (팀원분들이 바로 .name, .id 로 쓸 수 있게 해줍니다)
    return response.json();
  }

  // 그 외(단순 문자열 등) : 있는 그대로 텍스트로 리턴
  // (주로 성공 메시지나 토큰 값 등이 해당됩니다)
  return response.text();
};

const parseErrorMessage = async (response) => {
  try {
    const body = await parseResponseBody(response);

    if (!body) return '요청 실패';
    if (typeof body === 'string') return body;

    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }

    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }

    // 예외 응답 스키마가 고정되지 않은 경우를 대비해 body 전체를 fallback 메시지로 사용합니다.
    return JSON.stringify(body);
  } catch {
    return '요청 실패';
  }
};

// fetch 공통 진입점: 성공 시 body 파싱, 실패 시 사용자 친화적 메시지 throw
const request = async (endpoint, options = {}, { isMultipart = false } = {}) => {
  // 로그인 유지 여부에 따라 localStorage 또는 sessionStorage 중 한 곳에만 토큰이 저장됩니다.
  // 공통 fetch 계층에서는 두 저장소를 모두 확인해, 페이지 코드가 저장 위치를 알 필요 없게 만듭니다.
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options.headers, { isMultipart }),
  });

  if (!response.ok) {
    const errorMsg = await parseErrorMessage(response);
    const error = new Error(errorMsg || '요청 실패');
    // 상위 계층에서 인증 만료(401/403)와 네트워크 오류를 구분할 수 있게 상태코드를 함께 전달합니다.
    error.status = response.status;
    throw error;
  }

  return parseResponseBody(response);
};
/**
 * JSON 요청 전용 클라이언트
 * - 기존 FetchClient와 동일하게 Content-Type: application/json 기본 주입
 */
export const FetchJson = (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (method === 'GET') {
    delete headers['Content-Type'];
  }
  return request(endpoint, { ...options, headers }, { isMultipart: false });
};

/**
 * multipart/form-data 요청 전용 클라이언트
 * - FormData를 body로 넘기고 Content-Type은 브라우저가 자동으로 설정
 */
export const FetchMultipart = (endpoint, options = {}) => request(endpoint, options, { isMultipart: true });

// 기존 코드 호환용 alias (기본은 JSON 요청)
export const FetchClient = FetchJson;
