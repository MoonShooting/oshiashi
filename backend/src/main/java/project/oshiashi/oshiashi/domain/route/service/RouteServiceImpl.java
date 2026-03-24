package project.oshiashi.oshiashi.domain.route.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.route.dto.*;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.route.repository.RouteSpotRepository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RouteServiceImpl implements RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository userRepository;
    private final SpotRepository spotRepository;
    private final ArtworkRepository artworkRepository;
    private final RouteSpotRepository routeSpotRepository;

    // 루트 생성
    // 사용자 확인 -> Route 생성 -> RouteSpot 연결을 단일 트랜잭션으로 처리한다.
    // 프론트는 "선택한 장소 목록"만 전달하고, 저장 가능 여부/신규 spot 생성은 서버가 판정한다.

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
        addRouteSpots(route, request.getSpots(), request.getArtworkId());

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
    // 기존 RouteSpot을 제거 후 새로 생성한다.
    // create/update 모두 addRouteSpots를 재사용해 저장 계약을 동일하게 유지한다.
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
        addRouteSpots(route, request.getSpots(), request.getArtworkId());

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
    // 핵심 이유:
    // 프론트 입력원(DB spot / 지도 검색 / 지도 클릭)이 섞여도 저장 규칙은 서버에서 단일하게 판단해야 한다.
    // spotId 유무 분기를 프론트 여러 화면에서 처리하면,
    // - 화면별 예외 로직이 분산되고
    // - 동일 요청이 화면마다 다른 결과를 낼 수 있으며
    // - 권한/무결성 검증 누락 가능성이 높아진다.
    // 따라서 spot 생성/검증/연결 책임을 서버 한 곳으로 모은다.
    private void addRouteSpots(RouteEntity route, List<RouteSpotRequest> spotRequests, Long fallbackArtworkId) {
        for (int index = 0; index < spotRequests.size(); index += 1) {
            RouteSpotRequest spotRequest = spotRequests.get(index);
            SpotEntity spot = resolveSpotEntity(spotRequest, fallbackArtworkId, route.getTitle(), index);

            RouteSpotEntity routeSpot = RouteSpotEntity.of(route, spot, spotRequest.getVisitOrder());
            route.addRouteSpot(routeSpot);
        }
    }

    private SpotEntity resolveSpotEntity(RouteSpotRequest spotRequest, Long fallbackArtworkId, String routeTitle, int index) {
        // 기존 spot 참조 케이스
        if (spotRequest.getSpotId() != null) {
            return spotRepository.findById(spotRequest.getSpotId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 스팟입니다."));
        }

        // 신규 spot 생성 케이스:
        // spotId가 없으면 서버가 필수값을 검증하고 SpotEntity를 생성한다.
        // (프론트는 입력 전달만 담당, 저장 가능 여부 판정은 서버 책임)
        BigDecimal latitude = spotRequest.getLatitude();
        BigDecimal longitude = spotRequest.getLongitude();
        if (latitude == null || longitude == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "spotId가 없으면 latitude/longitude가 필요합니다.");
        }

        Long artworkId = spotRequest.getArtworkId() != null ? spotRequest.getArtworkId() : fallbackArtworkId;
        if (artworkId == null) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "spotId가 없으면 artworkId가 필요합니다.");
        }

        ArtworkEntity artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 작품입니다."));

        String spotName = normalizeSpotName(spotRequest.getSpotName(), index);
        String sceneImgUrl = normalizeSceneImgUrl(spotRequest.getSceneImgUrl(), routeTitle, spotName, index);

        SpotEntity created = SpotEntity.builder()
                .artwork(artwork)
                .name(spotName)
                .latitude(latitude)
                .longitude(longitude)
                .address(spotRequest.getAddress())
                .sceneImgUrl(sceneImgUrl)
                .build();

        return spotRepository.save(created);
    }

    private String normalizeSpotName(String spotName, int index) {
        if (spotName != null && !spotName.isBlank()) {
            return spotName.trim();
        }
        return "장소 " + (index + 1);
    }

    private String normalizeSceneImgUrl(String sceneImgUrl, String routeTitle, String spotName, int index) {
        if (sceneImgUrl != null && !sceneImgUrl.isBlank()) {
            return sceneImgUrl.trim();
        }

        // spot.scene_image_url이 NOT NULL + UNIQUE 제약이므로,
        // 클라이언트가 이미지를 보내지 않아도 서버가 충돌 없는 값을 생성한다.
        String safeRouteTitle = sanitizePathSegment(routeTitle, "route");
        String safeSpotName = sanitizePathSegment(spotName, "spot-" + (index + 1));
        return "https://oshiashi.local/route-spots/" + safeRouteTitle + "/" + safeSpotName + "-" + UUID.randomUUID() + ".jpg";
    }

    private String sanitizePathSegment(String raw, String fallback) {
        String source = (raw == null || raw.isBlank()) ? fallback : raw;
        return source.trim().replaceAll("[^a-zA-Z0-9가-힣_\\-]", "_");
    }

    // route 유효성 검사
    // 중요: spotId 필수 검증을 제거했다.
    // 이유는 "spotId 없는 임시 장소도 route 저장 요청으로 허용"하는 현재 UX와 계약을 맞추기 위해서다.
    // 대신 좌표/artwork 등 신규 spot 생성 조건은 resolveSpotEntity에서 강하게 검증한다.
    private void validateRequest(String title, List<RouteSpotRequest> spots) {
        if (title == null || title.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "루트 제목은 필수입니다.");
        }

        if (spots == null || spots.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "루트에는 최소 1개의 스팟이 필요합니다.");
        }

        Set<Integer> visitOrders = new HashSet<>();
        for (RouteSpotRequest spot : spots) {
            if (spot.getVisitOrder() == null || spot.getVisitOrder() < 1) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "visitOrder는 1 이상이어야 합니다.");
            }
            if (!visitOrders.add(spot.getVisitOrder())) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "visitOrder는 중복될 수 없습니다.");
            }
        }
    }

    // 루트에 장소 추가
    @Override
    @Transactional
    public RouteResponse addRouteItem(String userId, Long routeId, RouteItemAddRequest request) {

        RouteEntity route = routeRepository.findByRouteIdAndUser_UserId(routeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));

        SpotEntity spot = spotRepository.findById(request.getSpotId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 스팟입니다."));

        Integer visitOrder = request.getVisitOrder();

        if (visitOrder == null || visitOrder < 1) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "visitOrder는 1 이상이어야 합니다.");
        }

        boolean duplicatedOrder = route.getRouteSpots().stream()
                .anyMatch(routeSpot -> routeSpot.getVisitOrder().equals(visitOrder));

        if (duplicatedOrder) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "이미 사용 중인 방문 순서입니다.");
        }

        RouteSpotEntity routeSpot = RouteSpotEntity.of(route, spot, visitOrder);
        route.addRouteSpot(routeSpot);

        return RouteResponse.fromEntity(route);
    }

    // 루트 내 순서 변경
    @Override
    @Transactional
    public RouteResponse updateRouteItemOrder(String userId, Long routeId, RouteItemOrderUpdateRequest request) {

        RouteEntity route = routeRepository.findByRouteIdAndUser_UserId(routeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));

        List<RouteSpotEntity> routeSpots = routeSpotRepository.findByRoute_RouteIdOrderByVisitOrderAsc(routeId);

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "변경할 순서 정보가 없습니다.");
        }

        for (RouteItemOrderDto item : request.getItems()) {
            RouteSpotEntity target = routeSpots.stream()
                    .filter(rs -> rs.getRouteSpotId().equals(item.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 루트 아이템입니다."));

            if (item.getVisitOrder() == null || item.getVisitOrder() < 1) {
                throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "visitOrder는 1 이상이어야 합니다.");
            }

            target.updateVisitOrder(item.getVisitOrder());
        }

        return RouteResponse.fromEntity(route);
    }

    // 루트 내 장소 제거
    @Override
    @Transactional
    public void deleteRouteItem(String userId, Long routeId, Long itemId) {

        RouteEntity route = routeRepository.findByRouteIdAndUser_UserId(routeId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));

        RouteSpotEntity routeSpot = routeSpotRepository.findByRouteSpotIdAndRoute_RouteId(itemId, routeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 루트 아이템입니다."));

        route.getRouteSpots().remove(routeSpot);
    }
}
