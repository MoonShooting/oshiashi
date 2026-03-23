package project.oshiashi.oshiashi.domain.spot.map.service;

import project.oshiashi.oshiashi.domain.spot.map.dto.MapPlaceResponse;

import java.util.List;

public interface MapService {
    List<MapPlaceResponse> getPlaces();
    List<MapPlaceResponse> searchPlaces(String keyword, String mediaType);
    MapPlaceResponse getPlaceDetail(Long placeId);

    // 현재 좌표 기준 반경 내 장소를 조회합니다. mediaType은 DB artwork_type_name과 일치할 때만 필터링합니다.
    List<MapPlaceResponse> getNearbyPlaces(Double lat, Double lng, Double radiusKm, String mediaType, Integer limit);
    // 장소명 / 작품명 기준 자동완성 추천어를 조회합니다.
    List<String> autocompletePlaces(String keyword);

    List<MapPlaceResponse> getPlacesByTagName(String tagName);
}
