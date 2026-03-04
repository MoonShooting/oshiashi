package project.oshiashi.oshiashi.domain.post.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostResponse {
	private Long postId;
	private String userId;      // 작성자 ID
	private Long routeId;       // 연결된 루트 ID
	private String title;
	private String content;
	private LocalDateTime createdAt;
	private PostEntity.PostStatus status;
	private Integer viewCount;
	private Integer likeCount;
	private LocalDateTime updateAt;
	private List<PostImageResponse> images; // 이미지 목록
	
	public static PostResponse fromEntity(PostEntity postEntity) {
		return PostResponse.builder()
				.postId(postEntity.getPostId())
				.userId(postEntity.getUser().getUserId())
				.routeId(postEntity.getRoute().getRouteId())
				.title(postEntity.getTitle())
				.content(postEntity.getContent())
				.createdAt(postEntity.getCreatedAt())
				.status(postEntity.getStatus())
				.viewCount(postEntity.getViewCount())
				.likeCount(postEntity.getLikeCount())
				.updateAt(postEntity.getUpdateAt())
				.images(postEntity.getImages().stream()
						.map(PostImageResponse::fromEntity)
						.sorted(Comparator.comparing(PostImageResponse::getSortOrder))
						.collect(Collectors.toList()))
				// 스트림 -> 변환 -> 정렬 -> 결과물 생성
				.build();
	}
}
