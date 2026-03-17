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
	private UserAchievementId id; // 복합키 클래스 매핑

	@MapsId("userId") // UserAchievementId 내의 userId 필드와 매핑
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@MapsId("achievementId") // UserAchievementId 내의 achievementId 필드와 매핑
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

		// 중요: 전달받은 유저와 칭호 엔티티의 ID를 추출하여 복합키 객체를 생성합니다.
		// 이 과정이 없으면 @EmbeddedId 필드가 null이 되어 저장이 불가능합니다.
		this.id = new UserAchievementId(user.getUserId(), achievement.getAchievementId());

		// 생성 시점 시간 설정
		this.achievedAt = LocalDateTime.now();
	}
}