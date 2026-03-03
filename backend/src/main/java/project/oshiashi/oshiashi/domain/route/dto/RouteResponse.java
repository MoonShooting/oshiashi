package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteResponse {
	private Long routeId;
	private String userId;
	private String title;
	private Boolean isPublic;
	private LocalDateTime createdAt;
	
	// 이 루트에 속한 스팟들 (리스트 형태)
	private List<RouteSpotResponse> routeSpots;
	
	public static RouteResponse fromEntity(RouteEntity routeEntity) {
		return RouteResponse.builder()
				.routeId(routeEntity.getRouteId())
				.userId(routeEntity.getUser().getUserId())
				.title(routeEntity.getTitle())
				.isPublic(routeEntity.getIsPublic())
				.createdAt(routeEntity.getCreatedAt())
				.routeSpots(routeEntity.getRouteSpots().stream()// 1. 루트 엔티티 안에 든 스팟 리스트를 꺼내서
						.map(RouteSpotResponse::fromEntity)       // 2. 엔티티를 DTO 상자로 옮겨 담고
						.sorted(Comparator.comparing(RouteSpotResponse::getVisitOrder)) // 3. 방문 순서(visit_order)대로 정렬해서
						.collect(Collectors.toList()))            // 4. 최종 리스트로 묶어준다!
				.build();
	}
}
