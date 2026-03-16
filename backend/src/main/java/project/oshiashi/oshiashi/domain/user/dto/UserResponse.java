package project.oshiashi.oshiashi.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;

/**
 * [UserResponse: 사용자 정보 응답용 DTO]
 * - 역할: 클라이언트(프론트엔드)에게 유저 정보를 전달할 때 사용하는 데이터 전송 객체.
 * - 특징:
 * 1. 비밀번호와 같은 민감 정보는 담지 않음.
 * 2. 날짜 형식을 표준 포맷으로 변환하여 제공함.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

	private String userId; // 유저 아이디
	private String email;  // 이메일
	private String name;   // 실명
	private String nickname; // 활동 닉네임

	private UserEntity.Role role;       // 권한 (user, admin)
	private UserEntity.UserStatus status; // 상태 (active, dormant)

	// 날짜 정보를 프론트엔드에서 파싱하기 좋게 특정 포맷으로 직렬화하기 위한 코드
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createdAt;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime lastLoginAt;

	/**
	 * [정적 팩토리 메서드: fromEntity]
	 * - 엔티티(UserEntity)를 매개변수로 받아 Response DTO로 안전하게 변환함.
	 * - 서비스 계층에서 엔티티가 직접 외부로 나가는 것을 방지함.
	 */
	public static UserResponse fromEntity(UserEntity userEntity) {
		return UserResponse.builder()
				.userId(userEntity.getUserId())
				.email(userEntity.getEmail())
				.name(userEntity.getName())
				.nickname(userEntity.getNickname())
				.role(userEntity.getRole())
				.status(userEntity.getStatus())
				.createdAt(userEntity.getCreatedAt())
				.lastLoginAt(userEntity.getLastLoginAt())
				.build();
	}
}
