package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "post")
public class PostEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "post_id")
	private Long postId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "route_id", nullable = false)
	private RouteEntity route;

	@Column(name = "title", nullable = false)
	private String title;

	@Lob
	@Column(name = "content", columnDefinition = "TEXT")
	private String content;

	// [체크] 파일을 하나로 합칠 때는 @Convert를 직접 명시해주는 게 가장 확실합니다.
	@Convert(converter = PostStatusConverter.class)
	@Column(name = "status", nullable = false)
	private PostStatus status = PostStatus.PRIVATE;

	@Column(name = "view_count")
	private Integer viewCount = 0;

	@Column(name = "like_count")
	private Integer likeCount = 0;

	@Column(name = "created_at")
	private LocalDateTime createdAt;

	@Column(name = "update_at")
	private LocalDateTime updateAt;

	@OneToMany(mappedBy = "post")
	private List<CommentEntity> comments = new ArrayList<>();

	@OneToMany(mappedBy = "post")
	private List<PostImageEntity> images = new ArrayList<>();
	
	// --- 1. Enum 정의 ---
	public enum PostStatus {
		// 여기는 그냥 정의만 합니다.
		PUBLIC("public"),
		PRIVATE("private");
		
		private final String value;
		
		PostStatus(String value) {
			this.value = value;
		}
		
		// "이 Enum이 JSON으로 변환될 때는 이 메서드의 결과값을 사용해라"라는 뜻입니다.
		@com.fasterxml.jackson.annotation.JsonValue
		public String getValue() {
			return value;
		}
	}

	// --- 2. 컨버터 정의 (내부 클래스로 수용) ---
	/**
	 * [ @Converter ]
	 * - 이 클래스가 JPA 데이터 변환기임을 선언
	 * - 엔티티 내부의 static class로 선언하여 파일 하나로 관리 가능
	 * * [ 데이터 변환 방향 ]
	 * - DB -> 자바 : 소문자("public")를 대문자(PUBLIC)로 변환 (조회 시)
	 * - 자바 -> DB : 대문자(PUBLIC)를 소문자("public")로 변환 (저장 시)
	 */
	@Converter
	public static class PostStatusConverter implements AttributeConverter<PostStatus, String> {
		//@Override 사용 이유 : 같은 이름의 메서드가 없지만 오타 방지 및 오류를 찾는데 용이함으로 삽입
		@Override
		public String convertToDatabaseColumn(PostStatus attribute) {
			if (attribute == null) return null;
			return attribute.name().toLowerCase(); // 자바(PUBLIC) -> DB(public)
		}
		
		@Override
		public PostStatus convertToEntityAttribute(String dbData) {
			if (dbData == null || dbData.isBlank()) return null;
			return PostStatus.valueOf(dbData.toUpperCase()); // DB(public) -> 자바(PUBLIC)
		}
	}
	

	/**
	 * @Builder.Default
	 * - Lombok의 @Builder를 사용할 때, 초기화된 기본값(new ArrayList<>())이 무시되지 않도록 보장
	 * - 이게 없으면 빌더로 객체를 만들 때 postTags는 null이 되어버려 NullPointerException의 원인
	 * 	ascade = CascadeType.ALL (영속성 전이)
	 * 	- Post가 저장(persist)되거나 삭제(remove)될 때, PostTag도 같이 수정
	 * 	- 즉, postTagRepository.save()를 일일이 안 해도 postRepository.save(post)만 하면 태그도 같이 저장됩니다.
	 */
	@Builder.Default
	@OneToMany(
			mappedBy = "post",
			cascade = CascadeType.ALL,
			orphanRemoval = true // 고아객체 제거 tag또는 post가 사라지면 db에서 지워지게 함
	)
	private List<PostTagEntity> postTags = new ArrayList<>();
}