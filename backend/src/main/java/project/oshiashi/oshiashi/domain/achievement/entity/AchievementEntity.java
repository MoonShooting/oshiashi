package project.oshiashi.oshiashi.domain.achievement.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "achievement")
public class AchievementEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "achievement_id", nullable = false, updatable = false)
	private Long achievementId;

	@Column(name = "name", length = 100, nullable = false)
	private String name;

	@Column(name = "description", columnDefinition = "text")
	private String description;

	@Column(name = "icon_url", length = 500, nullable = false)
	private String iconUrl;
}