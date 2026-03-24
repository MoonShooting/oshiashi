package project.oshiashi.oshiashi.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.List;

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
	private UserEntity.UserStatus status; // 상태 (active, dormant, withdrawn)
	private Long selectedAchievementId;    // 칭호 ID
	private String selectedAchievementName;  // 칭호 이름 (프론트 표시용)
	private String selectedAchievementIcon;  // 칭호 아이콘 URL (프론트 표시용)

	// ✅ 추가: 보유한 전체 칭호 목록을 담기 위한 필드
	private List<UserAchievementResponse> achievements;

	// 날짜 정보를 프론트엔드에서 파싱하기 좋게 특정 포맷으로 직렬화하기 위한 코드
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime createdAt;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime lastLoginAt;

	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime deletedAt; // 탈퇴 요청 일시 (프론트에서 D-Day 계산 시 활용)

	/**
	 * [정적 팩토리 메서드: fromEntity - 아규먼트 1개]
	 * - 엔티티(UserEntity)를 매개변수로 받아 Response DTO로 안전하게 변환함.
	 * - 서비스 계층에서 엔티티가 직접 외부로 나가는 것을 방지함.
	 */
	public static UserResponse fromEntity(UserEntity userEntity) {
		UserResponseBuilder builder = UserResponse.builder()
				.userId(userEntity.getUserId())
				.email(userEntity.getEmail())
				.name(userEntity.getName())
				.nickname(userEntity.getNickname())
				.role(userEntity.getRole())
				.status(userEntity.getStatus())
				.createdAt(userEntity.getCreatedAt())
				.lastLoginAt(userEntity.getLastLoginAt())
				.deletedAt(userEntity.getDeletedAt()); // 탈퇴일시 매핑 추가
		// 유저가 장착 중인 대표 칭호가 있을 경우에만 내부 정보 추출 (NullPointerException 방어)
		if (userEntity.getSelectedAchievement() != null) {
			builder.selectedAchievementId(userEntity.getSelectedAchievement().getAchievementId())
					.selectedAchievementName(userEntity.getSelectedAchievement().getName())
					.selectedAchievementIcon(userEntity.getSelectedAchievement().getIconUrl());
		}
		return builder.build();
	}

	/**
	 * - 역할: 유저 정보와 보유 칭호 목록을 함께 받아 전체 프로필 정보를 구성함.
	 * - 서비스 계층의 updateMainAchievement 등에서 호출될 때 사용됨.
	 */
	public static UserResponse fromEntity(UserEntity userEntity, List<UserAchievementEntity> achievementEntities) {
		// 기존 1개짜리 메서드를 재활용하여 기본 정보를 먼저 생성
		UserResponse response = fromEntity(userEntity);

		// 보유 칭호 리스트가 있다면 DTO 리스트로 변환하여 세팅
		if (achievementEntities != null) {
			response.setAchievements(achievementEntities.stream()
					.map(UserAchievementResponse::fromEntity)
					.toList());
		}

		return response;
	}
}