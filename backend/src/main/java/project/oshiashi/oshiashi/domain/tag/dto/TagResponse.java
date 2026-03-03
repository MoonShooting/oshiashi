package project.oshiashi.oshiashi.domain.tag.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagResponse {
	private Long tagId;
	private String tagName;
	private Long artworkId;
	
	// from ? :  TagEntity를 받아서 딱 필요한 데이터만 담긴 TagResponse로 변환하는 과정이 필요한데
	public static TagResponse fromEntity(TagEntity tagEntity) {
		return TagResponse.builder()
				.tagId(tagEntity.getTagId())
				.tagName(tagEntity.getTagName())
				.artworkId(tagEntity.getArtwork() != null ? tagEntity.getArtwork().getArtworkId() : null)
				.build();
	}

}
