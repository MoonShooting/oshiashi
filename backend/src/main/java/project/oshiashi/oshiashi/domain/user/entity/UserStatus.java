package project.oshiashi.oshiashi.domain.user.entity;

/**
 * [UserStatus: 사용자 상태 열거형(Enum) 클래스]
 * * 💡 이 클래스가 꼭 필요한 이유 (왜 String 대신 Enum을 쓸까요?):
 * * 1. 완벽한 오타 방지 (Type Safety):
 * 개발자가 실수로 "active"를 "ative"나 "actice"라고 오타 내는 것을
 * 코드 작성(컴파일) 단계에서 빨간 줄을 띄워 완벽하게 막아줍니다.
 * * 2. 가독성 및 유지보수:
 * 우리 서비스의 유저가 가질 수 있는 모든 상태(정상, 휴면, 탈퇴 대기)가
 * 무엇인지 이 파일 하나만 열어보면 한눈에 파악할 수 있습니다.
 * * 3. DB와 자바의 안전한 연결 (JPA Mapping):
 * UserEntity에서 @Enumerated(EnumType.STRING)과 함께 사용하면,
 * DB에는 알아보기 쉬운 문자열("active", "withdrawn")로 자동 저장되고,
 * 자바 코드 안에서는 안전한 규격품(Enum 객체)으로 다룰 수 있습니다.
 */
public enum UserStatus {

	active,
	dormant,
	withdrawn

}