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
	private Long artworkId; // Spot이 연결된 작품 PK. route 태그를 자동 확정할 때 사용합니다.
	private String artworkTitle; // 작품 제목. 프론트에서는 작품 태그명과 같은 기준으로 사용합니다.
	private Integer visitOrder;  // 방문 순서

	// RouteSpotEntity → DTO 변환
	// API 응답으로 사용
	public static RouteSpotResponse fromEntity(RouteSpotEntity routeSpotEntity) {
		return RouteSpotResponse.builder()
				.routeId(routeSpotEntity.getRoute().getRouteId())
				.spotId(routeSpotEntity.getSpot().getSpotId())
				.spotName(routeSpotEntity.getSpot().getName())
				.artworkId(routeSpotEntity.getSpot().getArtwork().getArtworkId())
				.artworkTitle(routeSpotEntity.getSpot().getArtwork().getTitle())
				.visitOrder(routeSpotEntity.getVisitOrder())
				.build();
	}
}
