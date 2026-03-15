package project.oshiashi.oshiashi.domain.achievement.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "achievement")
public class AchievementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // nullable, updatable 추가
    @Column(name = "achievement_id", nullable = false, updatable = false)
    private Long achievementId;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    // length 제거, columnDefinition 추가
    @Column(name = "description", length = 255, columnDefinition = "text")
    private String description;

    // length 255로 수정, null 가능으로 변경
    @Column(name = "icon_url", length = 500, nullable = false)
    private String iconUrl;

    // ERD에 base_score가 필요하면 아래 주석 해제
    // @Column(name = "base_score")
    // private Integer baseScore;

    // 필요하면 생성용 팩토리/생성자 추가 가능 (지금은 최소 구성)
}