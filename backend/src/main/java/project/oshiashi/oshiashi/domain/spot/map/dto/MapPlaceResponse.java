/*package project.oshiashi.oshiashi.domain.spot.map.dto;

import lombok.Builder;
import lombok.Getter;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

// 지도 화면 전용 장소 응답 DTO입니다.
// Spot 원본 데이터에 Artwork 정보를 함께 묶어서,
// 프론트가 마커와 장소 카드 UI를 바로 그릴 수 있도록 구성합니다.
@Getter
@Builder
public class MapPlaceResponse {
    private Long placeId;         // 지도에서 특정 장소를 식별하기 위한 spot ID
    private Long artworkId;       // 이 장소가 어떤 작품과 연결되는지 나타내는 artwork ID
    private String artworkTitle;  // 지도 카드/상세 패널에 보여줄 작품 제목
    private String mediaType;     // 영화/드라마/애니메이션 구분값
    private String name;          // 장소 이름
    private Double latitude;      // 위도: 소수 좌표값이며 없을 경우 null 가능
    private Double longitude;     // 경도: 소수 좌표값이며 없을 경우 null 가능
    private String address;       // 장소 주소
    private String sceneImageUrl; // 장소/장면 대표 이미지

    // M_003 장소 요약 정보 보강용
    private Long relatedPostCount; // 이 장소가 포함된 루트를 참조하는 게시글 수
    private Boolean hasAddress;    // 주소 존재 여부
    private Boolean hasSceneImage; // 대표 이미지 존재 여부

    public static MapPlaceResponse from(SpotEntity spot) {
        return MapPlaceResponse.builder()
                .placeId(spot.getSpotId())
                .artworkId(spot.getArtwork().getArtworkId())
                .artworkTitle(spot.getArtwork().getTitle())
                .mediaType(spot.getArtwork().getArtworkType().getArtworkTypeName())
                .name(spot.getName())
                .latitude(spot.getLatitude() != null ? spot.getLatitude().doubleValue() : null)
                .longitude(spot.getLongitude() != null ? spot.getLongitude().doubleValue() : null)
                .address(spot.getAddress())
                .sceneImageUrl(spot.getSceneImgUrl())
                .relatedPostCount(0L)
                .hasAddress(spot.getAddress() != null && !spot.getAddress().isBlank())
                .hasSceneImage(spot.getSceneImgUrl() != null && !spot.getSceneImgUrl().isBlank())
                .build();
    }

    // 장소 상세 조회용: 관련 게시글 수까지 포함해 응답을 확장
    public static MapPlaceResponse from(SpotEntity spot, Long relatedPostCount) {
        return MapPlaceResponse.builder()
                .placeId(spot.getSpotId())
                .artworkId(spot.getArtwork().getArtworkId())
                .artworkTitle(spot.getArtwork().getTitle())
                .mediaType(spot.getArtwork().getArtworkType().getArtworkTypeName())
                .name(spot.getName())
                .latitude(spot.getLatitude() != null ? spot.getLatitude().doubleValue() : null)
                .longitude(spot.getLongitude() != null ? spot.getLongitude().doubleValue() : null)
                .address(spot.getAddress())
                .sceneImageUrl(spot.getSceneImgUrl())
                .relatedPostCount(relatedPostCount != null ? relatedPostCount : 0L)
                .hasAddress(spot.getAddress() != null && !spot.getAddress().isBlank())
                .hasSceneImage(spot.getSceneImgUrl() != null && !spot.getSceneImgUrl().isBlank())
                .build();
    }
}*/
package project.oshiashi.oshiashi.domain.spot.map.dto;

import lombok.Builder;
import lombok.Getter;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

/**
 * 지도 화면 전용 장소 응답 DTO
 *
 * 현재 프론트 연동 기준으로 Spot + Artwork 정보를 함께 묶어서 반환합니다.
 * - 장소 자체 정보: 이름, 좌표, 주소
 * - 작품 정보: 작품 id, 제목, 대표 이미지, 관련 게시글 수
 * - 프론트에서 바로 쓸 수 있도록 googleMapsUrl, buildingName도 포함합니다.
 */
@Getter
@Builder
public class MapPlaceResponse {

    private Long id;               // Spot ID
    private String name;           // 장소 이름
    private Double latitude;       // 위도
    private Double longitude;      // 경도
    private String address;        // 주소
    private String buildingName;   // 상세 위치/건물명 용도, 현재는 spot name 기준
    private String googleMapsUrl;  // 구글 지도 바로가기 URL
    private String mediaType;      // 애니메이션 / 영화 / 드라마

    private ArtworkInfo artwork;   // 작품 정보

    private Boolean hasAddress;
    private Boolean hasSceneImage;

    @Getter
    @Builder
    // 프론트가 pin.artwork.* 구조로 접근할 수 있도록 작품 정보를 별도 객체로 묶습니다.
    public static class ArtworkInfo {
        private Long id;           // Artwork ID
        private String title;      // 작품 제목
        private String posterUrl;  // 작품 대표 포스터
        private Long spotCount;    // 현재는 관련 게시글 수 또는 기본값 사용
    }

    // 목록/검색 응답에서는 관련 게시글 수가 없을 수 있으므로 기본값 0으로 내려줍니다.
    public static MapPlaceResponse from(SpotEntity spot) {
        return from(spot, 0L);
    }

    /**
     * 장소 상세 조회 등에서 관련 게시글 수를 함께 내려줄 때 사용합니다.
     */
    public static MapPlaceResponse from(SpotEntity spot, Long relatedPostCount) {
        Double lat = spot.getLatitude() != null ? spot.getLatitude().doubleValue() : null;
        Double lng = spot.getLongitude() != null ? spot.getLongitude().doubleValue() : null;

        return MapPlaceResponse.builder()
                .id(spot.getSpotId())
                .name(spot.getName())
                .latitude(lat)
                .longitude(lng)
                .address(spot.getAddress())
                // buildingName은 현재 별도 상세 건물명이 없어 spot name을 임시로 사용합니다.
                // googleMapsUrl은 프론트 추가 가공 없이 바로 외부 지도로 이동할 수 있도록 백엔드에서 생성합니다.
                .buildingName(spot.getName())
                .googleMapsUrl(buildGoogleMapsUrl(lat, lng))
                .mediaType(spot.getArtwork().getArtworkType().getArtworkTypeName())
                .artwork(ArtworkInfo.builder()
                        .id(spot.getArtwork().getArtworkId())
                        .title(spot.getArtwork().getTitle())
                        .posterUrl(spot.getArtwork().getPosterUrl())
                        // 현재 spotCount는 프론트 요구 구조를 맞추기 위한 값으로 사용 중이며,
                        // 실제 "작품의 장소 수"가 아니라 관련 게시글 수 기반 임시 값입니다.
                        .spotCount(relatedPostCount != null ? relatedPostCount : 0L)
                        .build())
                .hasAddress(spot.getAddress() != null && !spot.getAddress().isBlank())
                .hasSceneImage(spot.getSceneImgUrl() != null && !spot.getSceneImgUrl().isBlank())
                .build();
    }

    private static String buildGoogleMapsUrl(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            return null;
        }
        return "https://www.google.com/maps?q=" + latitude + "," + longitude;
    }
}

