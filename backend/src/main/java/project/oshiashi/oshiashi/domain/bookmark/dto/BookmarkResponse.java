package project.oshiashi.oshiashi.domain.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotEntity;
import project.oshiashi.oshiashi.domain.spot.map.dto.MapPlaceResponse;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkResponse {
	private Long bookmarkId;
	private String bookmarkName;
	private String userId;
	
	// 대상 식별자들 (셋 중 하나만 데이터가 있고 나머지는 null일 것임)
	private Long postId;
	private Long postImageId;
	private Long routeId;
	private String routeTitle;
	
	private LocalDateTime createdAt;

	// 북마크 초기 진입 화면에서 바로 지도에 핀을 그릴 수 있도록
	// 핀 개수(pinCount)와 핀 목록(pins)을 함께 반환합니다.
	private Integer pinCount;
	private List<MapPlaceResponse> pins;

	// 북마크 대상이 route / post / postImage 중 무엇이든,
    // 최종적으로 연결된 route를 기준으로 핀 목록을 정규화해서 생성합니다.
	public static BookmarkResponse fromEntity(BookmarkEntity bookmarkEntity) {
		RouteEntity route = resolveRoute(bookmarkEntity);
		List<MapPlaceResponse> pins = route == null
				? List.of()
				: route.getRouteSpots().stream()
				.sorted(Comparator.comparing(RouteSpotEntity::getVisitOrder))
				.map(RouteSpotEntity::getSpot)
				.map(MapPlaceResponse::from)
				.toList();

		return BookmarkResponse.builder()
				.bookmarkId(bookmarkEntity.getBookmarkId())
				.bookmarkName(bookmarkEntity.getBookmarkName())
				.userId(bookmarkEntity.getUser().getUserId())
				// null 체크를 포함하여 안전하게 매핑?
				// 비어있는 항목을 달라하면 에러가 나기 때문에
				// -> 내용물이 있는지 확인하고 있을 때만 번호를 가져온다는 안전장치를 걸어둔 것입니다.
				// -> 혹시나 값이 비어있다면 에러 대신 null을 반환하게 한것입니다
				.postId(bookmarkEntity.getPost() != null ? bookmarkEntity.getPost().getPostId() : null)
				.postImageId(bookmarkEntity.getPostImage() != null ? bookmarkEntity.getPostImage().getPostImageId() : null)
				// routeId도 직접 북마크된 route뿐 아니라,
				// post / postImage가 참조하는 route까지 포함해 일관된 기준으로 내려줍니다.
				.routeId(route != null ? route.getRouteId() : null)
				.routeTitle(route != null ? route.getTitle() : null)
				.createdAt(bookmarkEntity.getCreatedAt())
				.pinCount(pins.size())
				.pins(pins)
				.build();
	}

	// 북마크 타입별(route / post / postImage)로 흩어진 연결 구조를
	// 공통 route 하나로 정규화하는 헬퍼 메서드입니다.
	private static RouteEntity resolveRoute(BookmarkEntity bookmarkEntity) {
		if (bookmarkEntity.getRoute() != null) {
			return bookmarkEntity.getRoute();
		}
		if (bookmarkEntity.getPost() != null) {
			return bookmarkEntity.getPost().getRoute();
		}
		if (bookmarkEntity.getPostImage() != null && bookmarkEntity.getPostImage().getPost() != null) {
			return bookmarkEntity.getPostImage().getPost().getRoute();
		}
		return null;
	}
}
