package project.oshiashi.oshiashi.domain.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkResponse {
	private Long artworkId;
	private String title;
	private String posterUrl;
	private String description;
	private String spotifyAlbumId;
	
	// ArtworkTypeEntity에서 가져올 정보
	private Integer artworkTypeId;
	private String artworkTypeName; // 예: "애니메이션", "영화" 등
	
	public static ArtworkResponse fromEntity(ArtworkEntity artworkEntity) {
		return ArtworkResponse.builder()
				.artworkId(artworkEntity.getArtworkId())
				.title(artworkEntity.getTitle())
				.posterUrl(artworkEntity.getPosterUrl())
				.description(artworkEntity.getDescription())
				.spotifyAlbumId(artworkEntity.getSpotifyAlbumId())
				.artworkTypeId(artworkEntity.getArtworkType().getArtworkTypeId())
				.artworkTypeName(artworkEntity.getArtworkType().getArtworkTypeName())
				.build();
	}
}
