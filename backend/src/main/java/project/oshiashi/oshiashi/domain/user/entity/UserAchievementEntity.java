package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA를 위한 기본 생성자
@Entity
@Table(name = "user_achievement")
public class UserAchievementEntity {

	@EmbeddedId
	private UserAchievementId id;

	@MapsId("userId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@MapsId("achievementId")
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "achievement_id", nullable = false)
	private AchievementEntity achievement;

	@Column(name = "achieved_at", updatable = false)
	private LocalDateTime achievedAt = LocalDateTime.now();

	/**
	 * [수정 반영] 편의 생성자 및 빌더
	 * - @MapsId를 사용할 때는 연관 관계 객체(user, achievement)를 통해
	 * 복합키(id)를 직접 생성해서 넣어줘야 DB 저장 시 에러가 나지 않습니다.
	 */
	@Builder
	public UserAchievementEntity(UserEntity user, AchievementEntity achievement) {
		this.user = user;
		this.achievement = achievement;
		this.id = new UserAchievementId(user.getUserId(), achievement.getAchievementId());
		this.achievedAt = LocalDateTime.now();
	}
}