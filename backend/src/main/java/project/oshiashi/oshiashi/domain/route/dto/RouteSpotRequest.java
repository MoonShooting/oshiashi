package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// RouteSpot 생성 요청 DTO
// Route 생성 또는 수정 시
// 포함될 Spot 정보를 전달한다.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteSpotRequest {

    // Spot ID
    private Long spotId;

    // 루트 내 방문 순서
    private Integer visitOrder;

    // 왜 spot 확장 필드가 필요한가:
    // 프론트에서 지도 클릭으로 추가한 장소는 spotId가 없고 좌표/이름만 가진다.
    // route 저장 시 서버가 spot을 신규 생성하려면 아래 정보가 필요하므로 계약에 포함한다.
    // (검증 책임 역시 서버가 가진다.)
    private Long artworkId;
    private String spotName;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String sceneImgUrl;
}
