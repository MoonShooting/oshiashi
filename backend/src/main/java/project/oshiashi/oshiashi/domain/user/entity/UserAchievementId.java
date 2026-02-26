package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class UserAchievementId implements Serializable {

    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "achievement_id")
    private Long achievementId;
}