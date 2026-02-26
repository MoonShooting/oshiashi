package project.oshiashi.oshiashi.domain.route.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "Route_spot")
public class RouteSpotEntity {

    @EmbeddedId
    private RouteSpotId id;

    @MapsId("routeId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private RouteEntity route;

    @MapsId("spotId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id", nullable = false)
    private SpotEntity spot;

    @Column(name = "visit_order", nullable = false)
    private Integer visitOrder = 1;
}