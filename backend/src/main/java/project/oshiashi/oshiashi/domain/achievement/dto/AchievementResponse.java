package project.oshiashi.oshiashi.domain.achievement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AchievementResponse {
	private Long achievementId;
	private String name;
	private String description;
	private String iconUrl;
	
	public static AchievementResponse from(AchievementEntity achievementEntity) {
		return AchievementResponse.builder()
				.achievementId(achievementEntity.getAchievementId())
				.name(achievementEntity.getName())
				.description(achievementEntity.getDescription())
				.iconUrl(achievementEntity.getIconUrl())
				.build();
	}
}
