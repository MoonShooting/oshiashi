package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
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
	private Integer spotCount; // route에 포함된 장소 수
	private String artworkTagName; // route에 담긴 작품 태그 중 대표값 1개
	private List<String> artworkTagNames; // route에 담긴 작품 태그 전체 목록(중복 제거)
	
	// 이 루트에 속한 스팟들 (리스트 형태)
	private List<RouteSpotResponse> routeSpots;
	// 왜 alias가 필요한가:
	// 프론트의 기존 코드와 신규 코드가 `routeSpots`와 `spots`를 혼용하는 과도기를 안전하게 넘기기 위해
	// 동일 데이터를 두 키로 제공한다. 계약 정리 후 하나로 축소 가능하다.
	private List<RouteSpotResponse> spots; // 프론트 계약 단순화를 위한 alias
	
	public static RouteResponse fromEntity(RouteEntity routeEntity) {
		List<RouteSpotResponse> routeSpots = routeEntity.getRouteSpots().stream()
				.map(RouteSpotResponse::fromEntity)
				.sorted(Comparator.comparing(RouteSpotResponse::getVisitOrder))
				.collect(Collectors.toList());

		// 왜 artworkTagNames를 응답에서 직접 내려주는가:
		// 1) 게시물 작성 화면은 route 선택 후 태그를 자동 확정한다.
		// 2) 따라서 프론트가 별도 추론 없이 route 응답만으로 태그를 알 수 있어야 한다.
		// 3) 서버가 단일 기준(RouteSpot -> Spot -> Artwork.title)으로 생성해 내려주면
		//    화면별 계산 불일치 문제를 줄일 수 있다.
		List<String> artworkTagNames = routeSpots.stream()
				.map(RouteSpotResponse::getArtworkTitle)
				.filter(title -> title != null && !title.isBlank())
				.distinct()
				.collect(Collectors.toList());

		return RouteResponse.builder()
				.routeId(routeEntity.getRouteId())
				.userId(routeEntity.getUser().getUserId())
				.title(routeEntity.getTitle())
				.isPublic(routeEntity.getIsPublic())
				.createdAt(routeEntity.getCreatedAt())
				.spotCount(routeSpots.size())
				.artworkTagName(artworkTagNames.isEmpty() ? null : artworkTagNames.get(0))
				.artworkTagNames(artworkTagNames)
				.routeSpots(routeSpots)
				.spots(routeSpots)
				.build();
	}
}
