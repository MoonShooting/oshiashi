package project.oshiashi.oshiashi.domain.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkTypeEntity;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ArtworkTypeResponse {
	private Integer artworkTypeId;
	private String artworkTypeName;
	
	public static ArtworkTypeResponse from(ArtworkTypeEntity artworkTypeEntity) {
		return ArtworkTypeResponse.builder()
				.artworkTypeId(artworkTypeEntity.getArtworkTypeId())
				.artworkTypeName(artworkTypeEntity.getArtworkTypeName())
				.build();
	}
}
