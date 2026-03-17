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
@Table(name = "route")
public class RouteEntity {

    // 루트 PK
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Long routeId;

    // 루트를 생성한 사용자
    @ManyToOne(fetch = FetchType.LAZY, optional = false) // length 50
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_route_user")
    )
    private UserEntity user;

    // 루트 제목
    @Column(name = "title", length = 255, nullable = false)
    private String title;

    // 루트 공개 여부
    @Column(name = "is_public", nullable = false, columnDefinition = "tinyint(1)")
    private Boolean isPublic = false; // 디폴트 0으로

    // 루트 생성 시간
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /**
     * Route와 RouteSpot의 1:N 관계
     *
     * cascade = ALL
     *  → Route 저장/삭제 시 RouteSpot도 같이 처리
     *
     * orphanRemoval = true
     *  → RouteSpot 리스트에서 제거되면 DB에서도 삭제
     */
    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RouteSpotEntity> routeSpots = new ArrayList<>();

    // Route 생성용 빌더
    @Builder
    private RouteEntity(UserEntity user, String title, Boolean isPublic, LocalDateTime createdAt){
                this.user = user;
                this.title = title;
                this.isPublic = isPublic;
                this.createdAt = createdAt;

    }

    // Route 생성 팩토리 메서드
    // new RouteEntity 대신 사용 생성 시 기본값 설정
    public static RouteEntity of(UserEntity user, String title, Boolean isPublic){
        return RouteEntity.builder()
                .user(user)
                .title(title)
                .isPublic(isPublic != null ? isPublic : false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // 루트 정보 수정
    // null 값은 수정하지 않음
    public void update(String title, Boolean isPublic){
        if (title != null && !title.isBlank()){
            this.title = title;
        }
        if (isPublic != null){
            this.isPublic = isPublic;
        }
    }

    // 기존 RouteSpot 제거
    // orphanRemoval = true 때문에
    // DB에서도 삭제됨
    public void clearRouteSpot(){
        this.routeSpots.clear();
    }

    // RouteSpot 추가
    public void addRouteSpot(RouteSpotEntity routeSpot){
        this.routeSpots.add(routeSpot);
    }
}