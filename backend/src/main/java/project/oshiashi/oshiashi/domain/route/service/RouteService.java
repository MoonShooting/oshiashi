package project.oshiashi.oshiashi.domain.route.service;

import project.oshiashi.oshiashi.domain.route.dto.RouteCreateRequest;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.route.dto.RouteUpdateRequest;

import java.util.List;

// Route 도메인 서비스 인터페이스
// Route 관련 비즈니스 로직의 기능 정의
// 실제 구현은 RouteServiceImpl에서 처리된다.

public interface RouteService {

    // 루트 생성
    RouteResponse createRoute(String userId, RouteCreateRequest request);

    // 사용자 루트 목록 조회
    List<RouteResponse> getRouteList(String userId);

    // 특정 루트 하나 조회
    RouteResponse getRoute(String userId, Long routeId);

    // 루트 수정
    RouteResponse updateRoute(String userId, Long routeId, RouteUpdateRequest request);

    // 루트 삭제
    void deleteRoute(String userId, Long routeId);
}
