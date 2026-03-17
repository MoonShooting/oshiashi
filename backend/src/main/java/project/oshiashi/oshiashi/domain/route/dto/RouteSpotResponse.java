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


	private Long routeId; // RouteSpot PK
	private Long spotId; // Spot ID
	private String spotName; // Spot 이름
	private Integer visitOrder;  // 방문 순서

	// RouteSpotEntity → DTO 변환
	// API 응답으로 사용
	public static RouteSpotResponse fromEntity(RouteSpotEntity routeSpotEntity) {
		return RouteSpotResponse.builder()
				.routeId(routeSpotEntity.getRoute().getRouteId())
				.spotId(routeSpotEntity.getSpot().getSpotId())
				.spotName(routeSpotEntity.getSpot().getName())
				.visitOrder(routeSpotEntity.getVisitOrder())
				.build();
	}
}
