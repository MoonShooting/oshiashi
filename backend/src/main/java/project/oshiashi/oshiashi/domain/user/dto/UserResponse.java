package project.oshiashi.oshiashi.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
	private String userId;
	private String email;
	private String nickname;
	private UserEntity.Role role;
	private UserEntity.UserStatus status;
	private LocalDateTime createdAt;
	private LocalDateTime lastLoginAt;
	
	// Entity -> DTO 변환 정적 메서드 ?
	public static UserResponse fromEntity(UserEntity userEntity) {
		return UserResponse.builder()
				.userId(userEntity.getUserId())
				.email(userEntity.getEmail())
				.nickname(userEntity.getNickname())
				.role(userEntity.getRole())
				.status(userEntity.getStatus())
				.createdAt(userEntity.getCreatedAt())
				.lastLoginAt(userEntity.getLastLoginAt())
				.build();
	}
}
