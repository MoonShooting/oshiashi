package project.oshiashi.oshiashi.domain.route.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class RouteSpotId implements Serializable {

    @Column(name = "route_id")
    private Long routeId;

    @Column(name = "spot_id")
    private Long spotId;
}