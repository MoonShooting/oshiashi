package project.oshiashi.oshiashi.domain.map.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.map.dto.MapPlaceResponse;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;

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

    // 전체 장소를 지도용 응답 DTO(MapPlaceResponse)로 변환해서 반환합니다.
    // 추후 정렬/페이징이 필요하면 이 메서드에서 확장할 수 있습니다.
    @Override
    public List<MapPlaceResponse> getPlaces() {
        return spotRepository.findAll().stream()
                .map(MapPlaceResponse::from)
                .toList();
    }

    @Override
    public List<MapPlaceResponse> searchPlaces(String keyword) {
        // 빈 검색어로 전체 검색이 나가지 않도록 방지합니다.
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }

        return spotRepository.searchByKeyword(keyword.trim()).stream()
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
                .orElseThrow(() -> new IllegalArgumentException("장소를 찾을 수 없습니다."));

        // 장소와 관련된 게시글이 몇 개인지 세는 코드
        Long relatedPostCount = postRepository.countDistinctBySpotId(placeId);

        return MapPlaceResponse.from(spot, relatedPostCount);
    }
}
