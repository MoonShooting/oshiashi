package project.oshiashi.oshiashi.domain.comment.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Comment",
        indexes = {
                @Index(name = "IX_comment_post", columnList = "post_id"),
                @Index(name = "IX_comment_user", columnList = "user_id"),
                @Index(name = "IX_comment_created_at", columnList = "created_at")
        }
)
public class CommentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id", nullable = false, updatable = false)
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "post_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_comment_post")
    )
    private PostEntity post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_comment_user")
    )
    private UserEntity user;

    @Column(name = "content", length = 1000, nullable = false)
    private String content;

    /**
     * 추천: JPA Auditing 쓰면 @CreatedDate로 자동 입력 가능
     * (그 경우 nullable=false로 두고, 직접 세팅은 안 함)
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 대댓글이 필요해지면 아래처럼 "자기참조"가 가장 깔끔함
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "parent_comment_id", foreignKey = @ForeignKey(name="FK_comment_parent"))
    // private CommentEntity parent;
}