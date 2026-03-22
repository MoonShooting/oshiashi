package project.oshiashi.oshiashi.domain.map.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.map.dto.MapPlaceResponse;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.util.List;

// 지도 화면에서 필요한 조회 기능을 정의한 서비스 인터페이스입니다.
// 구현체(MapServiceImpl)에서는 Spot/Artwork 데이터를 조합해서 지도 전용 응답으로 변환합니다.
@Service
// final 필드(예: repository, service)를 주입받는 생성자를 Lombok이 자동으로 만들어줍니다.
// 직접 생성자를 작성하지 않아도 Spring이 생성자 주입 방식으로 빈을 연결할 수 있습니다.
@RequiredArgsConstructor
@Transactional(readOnly = true) // DB값을 조회만 할게용
public class MapServiceImpl implements MapService {
    private final SpotRepository spotRepository;
    private final PostRepository postRepository;
    private final ArtworkRepository artworkRepository;

    // 전체 장소를 지도용 응답 DTO(MapPlaceResponse)로 변환해서 반환합니다.
    // 추후 정렬/페이징이 필요하면 이 메서드에서 확장할 수 있습니다.
    @Override
    public List<MapPlaceResponse> getPlaces() {
        return spotRepository.findAll().stream()
                .map(MapPlaceResponse::from)
                .toList();
    }

    // 지도 범위(북/남/동/서) 안에 포함되는 장소만 조회합니다.
    // 현재 화면 안에 보이는 마커만 효율적으로 내려주기 위한 기능입니다.
    @Override
    public List<MapPlaceResponse> getMarkersInBounds(Double north, Double south, Double east, Double west) {
        return spotRepository.findMarkersInBounds(north, south, east, west).stream()
                .map(MapPlaceResponse::from)
                .toList();
    }

    // placeId에 해당하는 장소 1건을 조회합니다.
    // 마커 클릭 후 상세 패널/모달에 보여줄 데이터를 반환하는 용도입니다.
    @Override
    public MapPlaceResponse getPlaceDetail(Long placeId) {
        SpotEntity spot = spotRepository.findById(placeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "장소를 찾을 수 없습니다."));

        // 장소와 관련된 게시글이 몇 개인지 세는 코드
        Long relatedPostCount = postRepository.countDistinctBySpotId(placeId);

        return MapPlaceResponse.from(spot, relatedPostCount);
    }

    // 현재 좌표(lat, lng) 기준으로 radiusKm 반경 안에 있는 장소만 조회합니다.
    // 먼저 사각형 범위로 후보를 가져온 뒤, 실제 거리 계산으로 다시 한 번 필터링합니다.
    @Override
    public List<MapPlaceResponse> getNearbyPlaces(Double lat, Double lng, Double radiusKm) {
        // 좌표나 반경 값이 비정상이면 빈 목록을 반환합니다.
        if (lat == null || lng == null || radiusKm == null || radiusKm <= 0) {
            return List.of();
        }

        // 위도 1도는 대략 111km이므로, 반경을 위도 차이로 환산합니다.
        double latDelta = radiusKm / 111.0;

        // 경도는 위도에 따라 실제 거리 차이가 달라지므로 cos(latitude)로 보정합니다.
        double lngDelta = radiusKm / (111.0 * Math.cos(Math.toRadians(lat)));

        // 현재 좌표를 중심으로 반경을 감싸는 사각형 범위를 계산합니다.
        double north = lat + latDelta;
        double south = lat - latDelta;
        double east = lng + lngDelta;
        double west = lng - lngDelta;

        // DB에서는 먼저 사각형 범위 안의 후보 장소만 조회합니다.
        return spotRepository.findMarkersInBounds(north, south, east, west).stream()
                // 좌표 정보가 없는 장소는 주변 탐색 결과에서 제외합니다.
                .filter(spot -> {
                    if (spot.getLatitude() == null || spot.getLongitude() == null) {
                        return false;
                    }

                    // 현재 좌표와 장소 좌표 사이의 실제 거리를 km 단위로 계산합니다.
                    double distance = calculateDistanceKm(
                            lat,
                            lng,
                            spot.getLatitude().doubleValue(),
                            spot.getLongitude().doubleValue()
                    );

                    return distance <= radiusKm;
                })
                .map(MapPlaceResponse::from)
                .toList();
    }

    // 두 좌표 사이의 실제 거리를 Haversine 공식으로 계산합니다.
    private double calculateDistanceKm(double lat1, double lng1, double lat2, double lng2) {
        // 지구 반지름(km)
        final double earthRadiusKm = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        // Haversine 공식의 중간 계산값
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2)
                * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // 최종 거리(km)를 반환합니다.
        return earthRadiusKm * c;
    }

    // 장소명과 작품명을 함께 조회해서 자동완성 추천어 목록을 만듭니다.
    // 중복은 제거하고, 너무 많아지지 않도록 최대 10개까지만 반환합니다.
    @Override
    public List<MapPlaceResponse> searchPlaces(String keyword, String mediaType) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        String trimmedKeyword = keyword.trim();

        // mediaType이 없으면 기존 검색 로직 그대로 사용
        if (mediaType == null || mediaType.isBlank()) {
            return spotRepository.searchByKeyword(trimmedKeyword).stream()
                    .map(MapPlaceResponse::from)
                    .toList();
        }

        return spotRepository.searchByKeywordAndMediaType(trimmedKeyword, mediaType.trim()).stream()
                .map(MapPlaceResponse::from)
                .toList();
    }

    @Override
    public List<String> autocompletePlaces(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        String trimmedKeyword = keyword.trim();

        List<String> spotNames = spotRepository.findTop5SpotNamesByKeyword(trimmedKeyword);
        List<String> artworkTitles = artworkRepository.findTop5TitlesByKeyword(trimmedKeyword);

        return java.util.stream.Stream.concat(spotNames.stream(), artworkTitles.stream())
                .filter(name -> name != null && !name.isBlank())
                .distinct()
                .limit(10)
                .toList();
    }
}
