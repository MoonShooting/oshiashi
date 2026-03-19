package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

import java.time.LocalDateTime;

/**
 * [ 게시글-태그 매핑 엔티티 ]
 * - Post(N) : Tag(M) 관계를 일대다-다대일(1:N, N:1)로 풀어내기 위한 연결 테이블
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 규정상 기본 생성자 필요
@AllArgsConstructor(access = AccessLevel.PRIVATE) // 빌더 패턴 사용을 위한 전용 생성자
@Builder
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(
		name = "post_tag",
		uniqueConstraints = {
				@UniqueConstraint(
						name = "UX_post_tag_post_tag",
						columnNames = {"post_id", "tag_id"} // [데이터 무결성] 한 게시글에 동일한 태그가 중복 생성되는 것을 방지
				)
		},
		indexes = {
				@Index(name = "IX_post_tag_post", columnList = "post_id"), // [성능] 특정 게시글의 태그 목록 조회 시 최적화
				@Index(name = "IX_post_tag_tag", columnList = "tag_id")    // [성능] 특정 태그가 달린 게시글 검색 시 최적화
		}
)
public class PostTagEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "post_tag_id")
	private Long postTagId;

	/**
	 * 게시글 참조 (N:1)
	 * - FetchType.LAZY: 지연 로딩을 통해 불필요한 조인을 방지하고 성능을 최적화
	 * - optional = false: DB 수준의 Inner Join 유도 및 필수 관계임을 명시
	 */
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "post_id", nullable = false)
	private PostEntity post;

	/**
	 * 태그 참조 (N:1)
	 * - 실제 태그 이름 등 상세 정보는 TagEntity를 통해 관리
	 */
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "tag_id", nullable = false)
	private TagEntity tag;

	@CreatedDate
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	// --- 비즈니스 편의 메서드 ---

	/**
	 * 새로운 게시글-태그 연결 객체를 생성하는 정적 팩토리 메서드
	 * @param post 대상 게시글
	 * @param tag 부여할 태그
	 * @return 생성된 PostTagEntity 객체
	 */
	public static PostTagEntity create(PostEntity post, TagEntity tag) {
		return PostTagEntity.builder()
				.post(post)
				.tag(tag)
				.build();
	}
}