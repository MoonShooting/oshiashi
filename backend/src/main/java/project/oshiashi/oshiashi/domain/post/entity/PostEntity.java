package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "Post")
public class PostEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "post_id")
	private Long postId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
					name = "user_id",
					nullable = false,
					foreignKey = @ForeignKey(name = "FK_Post_User")
	)
	private UserEntity user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(
					name = "route_id",
					nullable = false,
					foreignKey = @ForeignKey(name = "FK_Post_Route")
	)
	private RouteEntity route;

	@Column(name = "title", length = 255, nullable = false)
	private String title;

	@Lob
	@Column(name = "content", columnDefinition = "TEXT", nullable = false)
	private String content;

	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 20, nullable = false)
	private PostStatus status; // PUBLIC / PRIVATE

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

	public enum PostStatus { PUBLIC, PRIVATE }
}