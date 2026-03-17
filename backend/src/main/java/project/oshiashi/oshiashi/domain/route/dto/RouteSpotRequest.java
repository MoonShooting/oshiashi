package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}