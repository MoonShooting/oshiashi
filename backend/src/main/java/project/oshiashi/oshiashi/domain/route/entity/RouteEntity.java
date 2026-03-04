package project.oshiashi.oshiashi.domain.route.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "Route")
public class RouteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Long routeId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // length 50
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_Route_User")
    )
    private UserEntity user;

    // length를 100으로 수정, nullable을 false로 정의 했습니다
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    // 공개 여부는 DB에서 처리하니 코드에서 false 초기값을 없에는것을 추천 받았습니다. 일단 남겨듈게요
    @Column(name = "is_public", nullable = false, columnDefinition = "tinyint(1)")
    private Boolean isPublic = false; // 디폴트 0으로

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /*
    @OneToMany(mappedBy = "route")
    private List<RouteSpotEntity> routeSpots = new ArrayList<>();*/
}