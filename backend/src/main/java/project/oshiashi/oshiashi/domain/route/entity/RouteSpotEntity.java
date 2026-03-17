package project.oshiashi.oshiashi.domain.route.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;


@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "route_spot",
        indexes = {
                @Index(name = "IX_route_spot_route", columnList = "route_id"),
                @Index(name = "IX_route_spot_spot", columnList = "spot_id")
        }
)
public class RouteSpotEntity {

    // RouteSpot PK
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_spot_id", nullable = false, updatable = false)
    private Long routeSpotId;

    // Route와 N:1 관계
    // 하나의 Route에 여러 Spot이 포함될 수 있음
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_Routespot_Route"))
    private RouteEntity route;

    // Spot과 N:1 관계
    // 하나의 Spot이 여러 Route에 포함될 수 있음
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "spot_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_Routespot_Spot"))
    private SpotEntity spot;

    // 루트 내 방문 순서
    @Column(name = "visit_order", nullable = false)
    private Integer visitOrder = 1;

    // RouteSpot 생성용 빌더
    @Builder
    private RouteSpotEntity(RouteEntity route, SpotEntity spot, Integer visitOrder) {
        this.route = route;
        this.spot = spot;
        this.visitOrder = visitOrder;
    }

    // RouteSpot 생성 팩토리 메서드
    public static RouteSpotEntity of(RouteEntity route, SpotEntity spot, Integer visitOrder) {
        return RouteSpotEntity.builder()
                .route(route)
                .spot(spot)
                .visitOrder(visitOrder != null ? visitOrder : 1)
                .build();
    }
}