package project.oshiashi.oshiashi.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostImageResponse {
	private Long postImageId;
	private Long postId;
	private String imageUrl;
	private LocalDateTime createdAt;
	private int sortOrder;
	private BigDecimal exifLatitude;
	private BigDecimal exifLongitude;
	
	public static PostImageResponse fromEntity(PostImageEntity postImageEntity) {
		return PostImageResponse.builder()
				.postImageId(postImageEntity.getPostImageId())
				.postId(postImageEntity.getPost().getPostId())
				.imageUrl(postImageEntity.getImageUrl())
				.createdAt(postImageEntity.getCreatedAt())
				.sortOrder(postImageEntity.getSortOrder())
				.exifLatitude(postImageEntity.getExifLatitude())
				.exifLongitude(postImageEntity.getExifLongitude())
				.build();
	}
}
