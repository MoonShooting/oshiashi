package project.oshiashi.oshiashi.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 프론트(AJAX)에서 전송하는 회원가입 JSON 데이터를 담는 상자
 * * [Entity 대신 DTO를 따로 만드는 이유]
 * 1. 보안: DB 테이블(Entity) 구조의 외부 노출 방지
 * 2. 유연성: '비밀번호 확인' 등 DB에 없는 일회성 데이터 처리를 위해
 */
@Data // Getter, Setter, ToString 등 자동 생성
@NoArgsConstructor // JSON -> 자바 객체 변환 시 기본 생성자 필수
@AllArgsConstructor // Builder 패턴 사용을 위한 전체 인자 생성자
@Builder // 객체 생성 시 가독성 향상 및 유연한 데이터 주입을 위해
public class UserSignUpRequest {
	private String userId;
	private String email;
	private String password;
	private String nickname;
}