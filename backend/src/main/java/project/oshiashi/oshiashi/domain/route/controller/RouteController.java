package project.oshiashi.oshiashi.domain.route.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.route.dto.RouteCreateRequest;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.route.dto.RouteUpdateRequest;
import project.oshiashi.oshiashi.domain.route.service.RouteService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/user/routes")
public class RouteController {

    // Route 관련 비즈니스 로직을 처리하는 서비스
    private final RouteService routeService;

    // 루트 생성
    // 사용자에게서 받은 루트 정보(title, 공개 여부, spot 목록)를 기반으로
    // 새로운 Route와 RouteSpot을 생성한다.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RouteResponse createRoute(
            @RequestParam String userId,
            @RequestBody RouteCreateRequest request
            ) {
        return routeService.createRoute(userId, request);
    }

    // 사용자 루트 목록 조회
    // 특정 사용자가 생성한 모든 루트를 조회한다.
    // 생성일 기준 최신순으로 정렬된다.
    @GetMapping
    public List<RouteResponse> getRoutes(@RequestParam String userId){
        return routeService.getRouteList(userId);
    }

    // 루트 단건 조회
    // 특정 루트의 상세 정보를 조회한다
    // Route에 포함된 Spot 목록도 함께 반환된다
    @GetMapping("/{routeId}")
    public RouteResponse getRoute(
            @RequestParam String userId,
            @PathVariable Long routeId
    ) {
       return routeService.getRoute(userId, routeId);
    }

    // 루트 수정
    // 루트의 제목, 공개 여부, 포함된 Spot 목록을 수정한다.
    @PatchMapping("/{routeId}")
    public RouteResponse updateRoute(
            @RequestParam String userId,
            @PathVariable Long routeId,
            @RequestBody RouteUpdateRequest request
    ) {
        return routeService.updateRoute(userId, routeId, request);
    }

    // 루트 삭제
    // 루트를 삭제하면 cascade 설정에 의해 RouteSpot도 함께 삭제된다.
    @DeleteMapping("/{routeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoute(
            @RequestParam String userId,
            @PathVariable Long routeId
    ) {
        routeService.deleteRoute(userId, routeId);
    }
}
