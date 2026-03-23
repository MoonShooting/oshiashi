package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 기본 생성자를 만들어주는
@EntityListeners(AuditingEntityListener.class) // 엔티티의 생성/수정 이벤트가 발생할 때 이를 감시하여 생성일(createdAt) 등을 자동으로 채워주는 리스너 설정
@Table(
		name = "post_like",
		uniqueConstraints = {
				@UniqueConstraint(
						name = "ux_post_like_user", // DB에 생성된 제약 조건의 이름
						columnNames = {"post_id", "user_id"} // ex "A 유저가 B 게시물에 좋아요를 딱 한 번만 누를 수 있게"
				)
		}
)
public class PostLikeEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "post_like_id")
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "post_id", nullable = false)
	private PostEntity post;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;
	
	@CreatedDate
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;
	
	public static PostLikeEntity create(PostEntity post, UserEntity user) {
		return PostLikeEntity.builder()
				.post(post)
				.user(user)
				.createdAt(LocalDateTime.now()) // 여기서 직접 시간을 넣어줌!
				.build();
	}
}
