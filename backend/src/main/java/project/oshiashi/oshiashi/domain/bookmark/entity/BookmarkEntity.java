package project.oshiashi.oshiashi.domain.bookmark.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
				name = "Bookmark",
				indexes = {
								@Index(name = "IX_bookmark_user", columnList = "user_id"),
								@Index(name = "IX_bookmark_post", columnList = "post_id"),
								@Index(name = "IX_bookmark_post_image", columnList = "post_image_id"),
								@Index(name = "IX_bookmark_route", columnList = "route_id"),
								@Index(name = "IX_bookmark_created_at", columnList = "created_at")
				}
)
public class BookmarkEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "book_mark_id", nullable = false, updatable = false)
	private Integer bookmarkId;

	@Column(name = "book_mark_name", length = 100, nullable = false)
	private String bookmarkName;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
					name = "user_id",
					nullable = false,
					foreignKey = @ForeignKey(name = "FK_bookmark_user")
	)
	private UserEntity user;

	// 셋 중 하나만 채워지는 구조(서비스에서 강제)
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(
					name = "post_id",
					foreignKey = @ForeignKey(name = "FK_bookmark_post")
	)
	private PostEntity post;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(
					name = "post_image_id",
					foreignKey = @ForeignKey(name = "FK_bookmark_post_image")
	)
	private PostImageEntity postImage;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(
					name = "route_id",
					foreignKey = @ForeignKey(name = "FK_bookmark_route")
	)
	private RouteEntity route;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
}