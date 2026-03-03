package project.oshiashi.oshiashi.domain.spot.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpotResponse {
	private Long spotId;
	private Long artworkId; //private ArtworkEntity artwork;  int -> 연관관계 매핑 (내부적으론 Integer/Long)??
	private String name;
	private BigDecimal latitude;
	private BigDecimal longitude;
	private String address;
	private String sceneImgUrl;
	
	public static SpotResponse fromEntity(SpotEntity spotEntity) {
		return SpotResponse.builder()
				.spotId(spotEntity.getSpotId())
				.artworkId(spotEntity.getArtwork().getArtworkId())
				.name(spotEntity.getName())
				.latitude(spotEntity.getLatitude())
				.longitude(spotEntity.getLongitude())
				.address(spotEntity.getAddress())
				.sceneImgUrl(spotEntity.getSceneImgUrl())
				.build();
	}
}
