package project.oshiashi.oshiashi.domain.map.service;

import project.oshiashi.oshiashi.domain.map.dto.MapPlaceResponse;

import java.util.List;

public interface MapService {
    List<MapPlaceResponse> getPlaces();
    List<MapPlaceResponse> searchPlaces(String keyword);
    List<MapPlaceResponse> getMarkersInBounds(Double north, Double south, Double east, Double west);
    MapPlaceResponse getPlaceDetail(Long placeId);
}
