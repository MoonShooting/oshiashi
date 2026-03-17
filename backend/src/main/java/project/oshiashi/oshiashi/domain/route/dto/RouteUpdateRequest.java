package project.oshiashi.oshiashi.domain.route.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// 루트 수정 요망
// 루트 제목, 공개 여부,
// 그리고 포함된 Spot 목록을 수정할 때 사용
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteUpdateRequest {

    // 루트 제목
    private String title;

    // 공개 야부
    private Boolean isPublic;

    // 루트에 포함된 Spot 목록
    private List<RouteSpotRequest> spots;
}
