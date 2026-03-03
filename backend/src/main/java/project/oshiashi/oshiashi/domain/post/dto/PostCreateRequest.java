package project.oshiashi.oshiashi.domain.post.dto;

import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCreateRequest {
	private Long routeId;    // 어떤 루트에 대한 후기인지
	private String title;
	private String content;
	private PostEntity.PostStatus status;
	private List<PostImageRequest> images; // 업로드할 이미지 정보들
}
