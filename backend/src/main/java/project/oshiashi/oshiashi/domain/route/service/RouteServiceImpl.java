package project.oshiashi.oshiashi.domain.route.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.route.dto.RouteCreateRequest;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.route.dto.RouteSpotRequest;
import project.oshiashi.oshiashi.domain.route.dto.RouteUpdateRequest;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteServiceImpl implements RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final SpotRepository spotRepository;

    // 루트 생성
    // 사용자 존재 여부 확인
    // Route 엔티티 생성
    // RouteSpot 생성 및 연결
    // Route 저장 (cascade로 RouteSpot도 함께 저장)

    @Override
    @Transactional
    public RouteResponse createRoute(String userId, RouteCreateRequest request) {
        validateRequest(request.getTitle(), request.getSpots());

        // 사용자 존재 확인
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 사용자입니다."));

        // Route 생성
        RouteEntity route = RouteEntity.of(user, request.getTitle(), request.getIsPublic());

        // RouteSpot 추가
        addRouteSpots(route, request.getSpots());

        // DB 저장
        RouteEntity saved = routeRepository.save(route);
        return RouteResponse.fromEntity(saved);
    }

    // 사용자 루트 목록 조회
    @Override
    public List<RouteResponse> getRouteList(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 사용자입니다.");
        }

        return routeRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(RouteResponse::fromEntity)
                .toList();
    }

    // 루트 단건 조회
    @Override
    public RouteResponse getRoute(String userId, Long routeId) {
        RouteEntity route = routeRepository.findByRouteIdAndUser_UserId(routeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));

        return RouteResponse.fromEntity(route);
    }

    // 루트 수정
    // 기존 RouteSpot을 제거 후 새로 생성
    @Override
    @Transactional
    public RouteResponse updateRoute(String userId, Long routeId, RouteUpdateRequest request) {
        validateRequest(request.getTitle(), request.getSpots());

        RouteEntity route = routeRepository.findByRouteIdAndUser_UserId(routeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));

        // 루트 기본 정보 수정
        route.update(request.getTitle(), request.getIsPublic());

        // 기존 RouteSpot 제거
        route.clearRouteSpot();

        // 새로운 RouteSpot 추가
        addRouteSpots(route, request.getSpots());

        return RouteResponse.fromEntity(route);
    }

    // 루트 삭제
    @Override
    @Transactional
    public void deleteRoute(String userId, Long routeId) {
        RouteEntity route = routeRepository.findByRouteIdAndUser_UserId(routeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));

        routeRepository.delete(route);
    }

    // RouteSpot 생성 및 Route에 연결
    private void addRouteSpots(RouteEntity route, List<RouteSpotRequest> spotRequests) {
        for (RouteSpotRequest spotRequest : spotRequests) {
            SpotEntity spot = spotRepository.findById(spotRequest.getSpotId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 스팟입니다."));

            RouteSpotEntity routeSpot = RouteSpotEntity.of(route, spot, spotRequest.getVisitOrder());
            route.addRouteSpot(routeSpot);
        }
    }

    // route 유효성 검사
    private void validateRequest(String title, List<RouteSpotRequest> spots) {
        if (title == null || title.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "루트 제목은 필수입니다.");
        }

        if (spots == null || spots.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "루트에는 최소 1개의 스팟이 필요합니다.");
        }

        Set<Integer> visitOrders = new HashSet<>();
        for (RouteSpotRequest spot : spots) {
            if (spot.getSpotId() == null) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "spotId는 필수입니다.");
            }
            if (spot.getVisitOrder() == null || spot.getVisitOrder() < 1) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "visitOrder는 1 이상이어야 합니다.");
            }
            if (!visitOrders.add(spot.getVisitOrder())) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "visitOrder는 중복될 수 없습니다.");
            }
        }
    }
}