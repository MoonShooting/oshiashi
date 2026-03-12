package project.oshiashi.oshiashi.global.constant;

public class RedisKeys {
    // 인스턴스화 방지 (상수만 모아둔 클래스임을 명시)
    private RedisKeys() {}

    /* enum처럼 명명하고 쓰기 위함. 여기서 상수처럼 관리하고 필요할 때 import 해서 꺼내 쓸 것임.
      - auth_code(6자리 난수): 3분짜리 이메일 인증번호 저장
      - verified_email(true): 인증 후 회원가입 완료 전까지 인증됨을 잠시 10분간 보관(하단에서 씁니다.)
      - refresh_token: 로그인 시 발급한 토큰 저장(7~14일 유지). 로그아웃 처리 시 삭제.
      추가 명명해서 사용할 수 있어서 확장성이 용이하다는 장점이 있습니다.
      - view_count: 게시글 조회수 중복 방지
      - place_cache: API 호출 결과 중 자주 바뀌지 않는 데이터를 캐싱하여 DB 부하 감소
    */
    public static final String AUTH_CODE = "auth_code:";
    public static final String VERIFIED_EMAIL = "verified_email:";
    public static final String REFRESH_TOKEN = "refresh_token:";
}
