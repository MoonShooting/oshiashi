package project.oshiashi.oshiashi.domain.achievement.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "Achievement")
public class AchievementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "achievement_id")
    private Long achievementId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "icon_url", length = 500, nullable = false)
    private String iconUrl;

    // ERD에 base_score가 필요하면 아래 주석 해제
    // @Column(name = "base_score")
    // private Integer baseScore;

    // 필요하면 생성용 팩토리/생성자 추가 가능 (지금은 최소 구성)
}