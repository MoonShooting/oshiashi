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
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "bookmark"
        /* // 인덱스 아직 없으니 주석처리
        ,indexes = {
                @Index(name = "IX_bookmark_user", columnList = "user_id"),
                @Index(name = "IX_bookmark_post", columnList = "post_id"),
                @Index(name = "IX_bookmark_post_image", columnList = "post_image_id"),
                @Index(name = "IX_bookmark_route", columnList = "route_id"),
                @Index(name = "IX_bookmark_created_at", columnList = "created_at")
        }*/
)
public class BookmarkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "book_mark_id", nullable = false, updatable = false)
    private Long bookmarkId;

    @Column(name = "book_mark_name", length = 100, nullable = false)
    private String bookmarkName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_bookmark_user")
    )
    private UserEntity user;

    /**
     * 북마크 대상(Post)
     * Bookmark 구조상 Post / PostImage / Route 중 하나만 참조함
     * 따라서 해당 컬럼은 nullable 이며 서비스에서 유효성 검증을 수행한다.
     */
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

    // 생성 시각 (DB 기본값 사용, 수정 방지)
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * CreateDate 있지만 Application 에서 설정이 필요하지만 이 기능은 JPA 기본 기능. 설정이 따로 필요 없음
     * 엔티티 저장(Persist) 직전에 실행
     * createdAt 값이 없을 경우 현재 시간으로 자동 설정
     */
    @PrePersist
    private void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}