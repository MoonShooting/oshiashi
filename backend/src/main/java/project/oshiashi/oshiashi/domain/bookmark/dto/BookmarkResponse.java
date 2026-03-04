package project.oshiashi.oshiashi.domain.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkResponse {
	private Integer bookmarkId;     // 명세서에 int로 되어있으므로 Integer
	private String bookmarkName;
	private String userId;
	
	// 대상 식별자들 (셋 중 하나만 데이터가 있고 나머지는 null일 것임)
	private Long postId;
	private Long postImageId;
	private Long routeId;
	
	private LocalDateTime createdAt;
	
	public static BookmarkResponse fromEntity(BookmarkEntity bookmarkEntity) {
		return BookmarkResponse.builder()
				.bookmarkId(bookmarkEntity.getBookmarkId())
				.bookmarkName(bookmarkEntity.getBookmarkName())
				.userId(bookmarkEntity.getUser().getUserId())
				// null 체크를 포함하여 안전하게 매핑?
				.postId(bookmarkEntity.getPost() != null ? bookmarkEntity.getPost().getPostId() : null)
				.postImageId(bookmarkEntity.getPostImage() != null ? bookmarkEntity.getPostImage().getPostImageId() : null)
				.routeId(bookmarkEntity.getRoute() != null ? bookmarkEntity.getRoute().getRouteId() : null)
				.createdAt(bookmarkEntity.getCreatedAt())
				.build();
	}
}
