package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "User_achievement",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_achievement",
                        columnNames = {"user_id", "achievement_id"}
                )
        },
        indexes = {
                @Index(name = "idx_user_achievement_user", columnList = "user_id"),
                @Index(name = "idx_user_achievement_achievement", columnList = "achievement_id")
        }
)
@EntityListeners(AuditingEntityListener.class)
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

    @CreatedDate
    @Column(name = "achieved_at", updatable = false)
    private LocalDateTime earnedAt;

    /**
     * 편의 생성자 (서비스에서 만들기 편하게)
     * - earnedAt은 @CreatedDate로 자동 입력
     */
    public UserAchievementEntity(UserEntity user, AchievementEntity achievement) {
        this.user = user;
        this.achievement = achievement;

        // 여기서 user.getUserId()는 String이어야 함 (스크린샷 기준)
        this.id = new UserAchievementId(user.getUserId(), achievement.getAchievementId());
    }
}