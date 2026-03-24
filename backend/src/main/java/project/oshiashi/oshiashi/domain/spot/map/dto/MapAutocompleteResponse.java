package project.oshiashi.oshiashi.domain.spot.map.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * 지도 검색 자동완성 응답 DTO
 - 문자열 배열 대신 artworkId / title / mediaType을 함께 내려줍니다.
 - 프론트가 자동완성 선택 후 후속 검색 또는 작품 식별에 바로 사용할 수 있습니다.
 */
@Getter
@Builder
public class MapAutocompleteResponse {
    private Long artworkId;
    private String title;
    private String mediaType;
}
