package project.oshiashi.oshiashi.domain.route.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "Route_spot",
        indexes = {
                @Index(name = "IX_route_spot_route", columnList = "route_id"),
                @Index(name = "IX_route_spot_spot", columnList = "spot_id")
        }
)
public class RouteSpotEntity {


    
    // RouteSpotId 추가
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_spot_id", nullable = false, updatable = false)
    private Long routeSpotId;

    // optional = false 구문을 추가 했습니다
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id",
            nullable = false,foreignKey = @ForeignKey(name = "FK_Routespot_Route"))
    private RouteEntity route;

    // optional = false 구문을 추가 했습니다
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "spot_id", nullable = false,
            foreignKey = @ForeignKey(name = "FK_Routespot_Spot"))
    private SpotEntity spot;

    @Column(name = "visit_order", nullable = false)
    private Integer visitOrder = 1;
}