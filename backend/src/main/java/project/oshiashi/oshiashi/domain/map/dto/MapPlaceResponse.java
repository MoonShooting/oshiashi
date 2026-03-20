package project.oshiashi.oshiashi.domain.map.dto;

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
}
