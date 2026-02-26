package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Post_image",
        uniqueConstraints = {
                // 한 게시글 내 이미지 정렬 순서가 중복되면 꼬이니까 추천 (원치 않으면 삭제)
                @UniqueConstraint(name = "UX_post_image_post_sort", columnNames = {"post_id", "sort_order"})
        },
        indexes = {
                @Index(name = "IX_post_image_post", columnList = "post_id"),
                @Index(name = "IX_post_image_created_at", columnList = "created_at")
        }
)
public class PostImageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_image_id", nullable = false, updatable = false)
    private Long postImageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "post_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_post_image_post")
    )
    private PostEntity post;

    @Column(name = "image_url", length = 2000, nullable = false)
    private String imageUrl;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "exif_latitude", precision = 10, scale = 7)
    private BigDecimal exifLatitude;

    @Column(name = "exif_longitude", precision = 10, scale = 7)
    private BigDecimal exifLongitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}