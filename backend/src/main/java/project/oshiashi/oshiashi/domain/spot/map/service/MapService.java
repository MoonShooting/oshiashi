package project.oshiashi.oshiashi.domain.spot.map.service;

import project.oshiashi.oshiashi.domain.spot.map.dto.MapPlaceResponse;

import java.util.List;

public interface MapService {
    List<MapPlaceResponse> getPlaces();
    List<MapPlaceResponse> searchPlaces(String keyword, String mediaType);
    List<MapPlaceResponse> getMarkersInBounds(Double north, Double south, Double east, Double west);
    MapPlaceResponse getPlaceDetail(Long placeId);

    // 현재 좌표 기준 반경 내 장소를 조회합니다.
    List<MapPlaceResponse> getNearbyPlaces(Double lat, Double lng, Double radiusKm);
    // 장소명 / 작품명 기준 자동완성 추천어를 조회합니다.
    List<String> autocompletePlaces(String keyword);

    List<MapPlaceResponse> getPlacesByTagName(String tagName);
}
