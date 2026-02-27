package project.oshiashi.oshiashi.domain.bookmark.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class BookmarkCreateRequest {
	private String bookmarkName;
	
	private Long postId;
	private Long postImageId;
	private Long routeId;
}
