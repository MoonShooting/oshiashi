package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteSpotResponse {
	private Long routeId;
	private Long spotId;
	
	private Integer visitOrder;
	
	public static RouteSpotResponse fromEntity(RouteSpotEntity routeSpotEntity) {
		return RouteSpotResponse.builder()
				.routeId(routeSpotEntity.getId().getRouteId())
				.spotId(routeSpotEntity.getId().getSpotId())
				.visitOrder(routeSpotEntity.getVisitOrder())
				.build();
	}
}
