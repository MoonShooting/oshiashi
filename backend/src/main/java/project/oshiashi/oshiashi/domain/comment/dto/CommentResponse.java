package project.oshiashi.oshiashi.domain.comment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
	private Long commentId;
	private Long postId;
	private String userId;
	private String nickname; // 작성자 이름 (화면 표시용)
	private String content;
	private LocalDateTime createdAt;
	//private Long parentId; //대댓글용
	
	public static CommentResponse fromEntity(CommentEntity commentEntity) {
		return CommentResponse.builder()
				.commentId(commentEntity.getCommentId())
				.postId(commentEntity.getPost().getPostId())
				.userId(commentEntity.getUser().getUserId())
				.nickname(commentEntity.getUser().getNickname())
				.content(commentEntity.getContent())
				.createdAt(commentEntity.getCreatedAt())
				// 엔티티의 parent가 null이 아니면(대댓글이면) 그 부모의 ID를 넣어줌
				//.parentId(commentEntity.getParent() != null ? commentEntity.getParent().getCommentId() : null)
				.build();
	}
}
