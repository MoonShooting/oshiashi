const BASE_URL = 'http://localhost:9933';

/* 
[공통 함수로 fetchClient를 만든 이유]
- 자동 토큰 주입: 로그인 후 accessToken을 일일이 헤더에 넣을 필요가 없습니다. (자동 처리)
- 똑똑한 응답 변환: 백엔드가 객체(JSON)를 주면 알아서 자바스크립트 객체로, 문자열을 주면 텍스트로 바꿔줍니다.
- 에러 조기 발견: 서버 에러(404, 500 등) 발생 시 명확한 에러 메시지를 던져줍니다.
- 코드 단축: 반복되는 BASE_URL이나 headers 설정을 생략할 수 있어 코드가 깔끔해집니다.
*/
export const fetchClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');

  // 기본 옵션 설정 (이걸 여러번 안써도 됨.)
  const defaultOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // fetch 실행
  const response = await fetch(`${BASE_URL}${endpoint}`, defaultOptions);

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(errorMsg || '요청 실패');
  }

  /* 
  [데이터 타입 자동 변환 로직]
  Java Spring는 객체(DTO)를 보낼 때
  '이건 JSON 데이터야'라고 말해주며(Content-Type: application/json) 보냅니다.
   */
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    // 백엔드가 객체를 보냈다면: 자바스크립트 객체로 변환해서 리턴
    // (팀원분들이 바로 .name, .id 로 쓸 수 있게 해줍니다)
    return await response.json();
  } else {
    // 그 외(단순 문자열 등) : 있는 그대로 텍스트로 리턴
    // (주로 성공 메시지나 토큰 값 등이 해당됩니다)
    return await response.text();
  }
};
