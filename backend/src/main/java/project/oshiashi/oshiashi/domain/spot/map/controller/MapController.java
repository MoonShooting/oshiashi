package project.oshiashi.oshiashi.domain.spot.map.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.spot.map.dto.MapPlaceResponse;
import project.oshiashi.oshiashi.domain.spot.map.service.MapService;

import java.util.List;

// 지도 화면에서 사용하는 조회 전용 API를 모아둔 컨트롤러입니다.
// Spot 자체를 생성/수정하는 역할이 아니라,
// 지도에 표시할 장소 목록, 검색 결과, 마커, 상세 정보를 내려주는 역할을 합니다.
@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;

    // 사용할 기본 장소 목록 조회
    // 프론트는 이 결과를 바탕으로 초기 마커나 장소 리스트를 그릴 수 있습니다.
    @GetMapping
    public List<MapPlaceResponse> getPlaces() {
        return mapService.getPlaces();
    }

    // 사용자가 검색창에 입력한 키워드로 장소를 검색합니다.
    // 장소명 또는 작품명으로 검색하고, 필요하면 작품 타입(mediaType)으로 필터링합니다.
    @GetMapping("/search")
    public List<MapPlaceResponse> searchPlaces(
            @RequestParam String keyword,
            @RequestParam(required = false) String mediaType
    ) {
        return mapService.searchPlaces(keyword, mediaType);
    }

    // 현재 지도 화면에 보이는 범위 안의 장소만 조회합니다.
    // 프론트가 지도 이동/확대 축소 후 보이는 영역에 맞는 마커만 다시 그릴 때 사용합니다.
    @GetMapping("/markers")
    public List<MapPlaceResponse> getMarkers(
            @RequestParam Double north, // 여기도 더블이네
            @RequestParam Double south,
            @RequestParam Double east,
            @RequestParam Double west
    ) {
        return mapService.getMarkersInBounds(north, south, east, west);
    }

    // 사용자가 특정 마커를 클릭했을 때 보여줄 장소 상세 정보를 조회합니다.
    // 반경(radiusKm) 안에 있는 장소 목록을 조회합니다.
    @GetMapping("/{placeId}")
    public MapPlaceResponse getPlaceDetail(@PathVariable Long placeId) {
        return mapService.getPlaceDetail(placeId);
    }

    // 현제 위치 또는 지도 중심 좌표 기준으로 반경 내 장소를 조회
    @GetMapping("/nearby")
    public List<MapPlaceResponse> getNearbyPlaces(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "3.0") Double radiusKm
    ) {
        return mapService.getNearbyPlaces(lat, lng, radiusKm);
    }
    // 검색창 자동완성용 추천어를 조회합니다.
    @GetMapping("/autocomplete")
    public List<String> autocompletePlaces(@RequestParam String keyword) {
        return mapService.autocompletePlaces(keyword);
    }

    // 태그명으로 장소(Spot) 목록 조회
    // 현재 태그는 작품 제목 태그이므로, 내부적으로는 tagName -> artworkId를 찾은 뒤
    // 해당 작품에 연결된 Spot 목록을 조회합니다.
    @GetMapping("/by-tag")
    public List<MapPlaceResponse> getPlacesByTag(@RequestParam String tagName) {
        return mapService.getPlacesByTagName(tagName);
    }
}
