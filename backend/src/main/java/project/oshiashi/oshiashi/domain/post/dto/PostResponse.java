package project.oshiashi.oshiashi.domain.post.dto;

import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity.PostStatus;
import project.oshiashi.oshiashi.domain.post.entity.PostTagEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * [ 게시글 응답 DTO ]
 * - DB에서 조회한 데이터를 클라이언트에게 전달할 때 사용합니다.
 * - 엔티티 내부의 모든 필드와 함께, 매핑된 태그 이름 리스트를 포함합니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PostResponse {

	private Long postId;        // 게시글 고유 ID
	private String title;       // 제목
	private String content;     // 내용
	private PostStatus status;  // 공개 여부 (PUBLIC, PRIVATE 등)
	private Integer viewCount;  // 조회수
	private Integer likeCount;  // 좋아요 수
	private LocalDateTime createdAt; // 생성 일시
	private LocalDateTime updateAt;  // 수정 일시

	/**
	 * 태그 이름 리스트
	 * - PostTagEntity 리스트에서 태그 이름(String)만 추출하여 담습니다.
	 */
	private List<String> tagNames;

	/**
	 * 엔티티를 DTO로 변환하는 정적 팩토리 메서드
	 * @param entity 변환할 PostEntity
	 * @return 변환된 PostResponse
	 */
	public static PostResponse fromEntity(PostEntity entity) {
		return PostResponse.builder()
				.postId(entity.getPostId())
				.title(entity.getTitle())
				.content(entity.getContent())
				.status(entity.getStatus())
				.viewCount(entity.getViewCount())
				.likeCount(entity.getLikeCount())
				.createdAt(entity.getCreatedAt())
				.updateAt(entity.getUpdateAt())
				// [핵심] PostTagEntity 리스트를 순회하며 태그 이름만 String 리스트로 수집
				.tagNames(entity.getPostTags().stream()
						.map(postTag -> postTag.getTag().getTagName())
						.collect(Collectors.toList()))
				.build();
	}
}
