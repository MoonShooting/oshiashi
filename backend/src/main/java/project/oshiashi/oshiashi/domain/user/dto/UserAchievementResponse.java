package project.oshiashi.oshiashi.domain.user.dto;

import lombok.Builder;
import lombok.Getter;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;

import java.time.LocalDateTime;

@Getter
@Builder
public class UserAchievementResponse {
	private Long achievementId;
	private String name;
	private String iconUrl;
	private LocalDateTime achievedAt; // "유저가 획득한" 시간

	public static UserAchievementResponse fromEntity(UserAchievementEntity ua) {
		return UserAchievementResponse.builder()
				.achievementId(ua.getAchievement().getAchievementId()) // 마스터 테이블의 ID
				.name(ua.getAchievement().getName())                   // 마스터 테이블의 이름
				.iconUrl(ua.getAchievement().getIconUrl())             // 마스터 테이블의 아이콘
				.achievedAt(ua.getAchievedAt())                        // 내역 테이블의 획득 시간
				.build();
	}
}
