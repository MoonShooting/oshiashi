package project.oshiashi.oshiashi.domain.route.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.route.dto.*;
import project.oshiashi.oshiashi.domain.route.service.RouteService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/map")
public class RouteController {

    // Route 관련 비즈니스 로직을 처리하는 서비스
    private final RouteService routeService;

    // 루트 생성
    // 사용자에게서 받은 루트 정보(title, 공개 여부, spot 목록)를 기반으로
    // 새로운 Route와 RouteSpot을 생성한다.
    @PostMapping("/routes")
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
    @GetMapping("/routes")
    public List<RouteResponse> getRoutes(@RequestParam String userId){
        return routeService.getRouteList(userId);
    }

    // 루트 상세 조회
    // 특정 루트의 상세 정보를 조회한다
    // Route에 포함된 Spot 목록도 함께 반환된다
    @GetMapping("/routes/{routeId}")
    public RouteResponse getRoute(
            @RequestParam String userId,
            @PathVariable Long routeId
    ) {
       return routeService.getRoute(userId, routeId);
    }

    // 루트 수정
    // 루트의 제목, 공개 여부, 포함된 Spot 목록을 수정한다.
    @PatchMapping("/routes/{routeId}")
    public RouteResponse updateRoute(
            @RequestParam String userId,
            @PathVariable Long routeId,
            @RequestBody RouteUpdateRequest request
    ) {
        return routeService.updateRoute(userId, routeId, request);
    }

    // 루트 삭제
    // 루트를 삭제하면 cascade 설정에 의해 RouteSpot도 함께 삭제된다.
    @DeleteMapping("/routes/{routeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoute(
            @RequestParam String userId,
            @PathVariable Long routeId
    ) {
        routeService.deleteRoute(userId, routeId);
    }

    // 루트에 장소 추가
    @PostMapping("/routes/{routeId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public RouteResponse addRouteItem(
            @RequestParam String userId,
            @PathVariable Long routeId,
            @RequestBody RouteItemAddRequest request
            ) {
        return routeService.addRouteItem(userId, routeId, request);
    }

    // 루트 내 순서 변경
    @PatchMapping("/routes/{routeId}/sequence/order")
    public RouteResponse updateRouteItemOrder(
            @RequestParam String userId,
            @PathVariable Long routeId,
            @RequestBody RouteItemOrderUpdateRequest request
            ) {
        return routeService.updateRouteItemOrder(userId, routeId, request);
    }

    // 루트 내 장소 제거
    @DeleteMapping("/routes/{routeId}/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRouteItem(
            @PathVariable Long routeId,
            @PathVariable Long itemId,
            @RequestParam String userId

    ){
        routeService.deleteRouteItem(userId, routeId, itemId);
    }
}
