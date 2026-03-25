package project.oshiashi.oshiashi.domain.achievement.dto;

import lombok.*;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import java.time.LocalDateTime;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class AchievementResponse {
	private Long achievementId;
	private String name;
	private String description;
	private String iconUrl;
	private LocalDateTime achievedAt;

	/**
	 * [엔티티 -> DTO 변환]
	 * - 파라미터명을 userAchievement로 사용하여 의미를 명확히 했습니다.
	 */
	public static AchievementResponse from(UserAchievementEntity userAchievement) {
		return AchievementResponse.builder()
				.achievementId(userAchievement.getAchievement().getAchievementId())
				.name(userAchievement.getAchievement().getName())
				.description(userAchievement.getAchievement().getDescription())
				.iconUrl(userAchievement.getAchievement().getIconUrl())
				.achievedAt(userAchievement.getAchievedAt())
				.build();
	}
}