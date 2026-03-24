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

    // 왜 PATCH 계약에도 artworkId가 필요한가:
    // 기존 route 수정에서도 "이미 저장된 spot"과 "신규 임시 spot"이 섞여 들어올 수 있다.
    // 생성(create)과 수정(update)의 저장 규칙이 달라지면 화면마다 예외 분기가 늘어나므로,
    // 서버가 동일 계약으로 신규 spot 생성/검증을 수행할 수 있게 기본 artworkId를 받는다.
    private Long artworkId;

    // 루트에 포함된 Spot 목록
    private List<RouteSpotRequest> spots;
}
