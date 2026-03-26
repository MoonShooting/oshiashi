package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteCreateRequest {
	private String title;
	private Boolean isPublic;
	// 왜 backend 입력 계약에 artworkId가 필요한가:
	// 1) SpotPage에서는 DB spot 선택 + 지도 클릭 임시 spot이 함께 전송될 수 있다.
	// 2) 임시 spot은 spotId가 없어서 route_spot FK를 바로 만들 수 없다.
	// 3) 따라서 서버가 "신규 spot 생성 후 route_spot 연결"을 단일 트랜잭션으로 처리해야 한다.
	// 4) 이때 spot.artwork FK를 채우기 위한 기본 artworkId가 필요하다.
	private Long artworkId;
	private List<RouteSpotRequest> spots;
}
