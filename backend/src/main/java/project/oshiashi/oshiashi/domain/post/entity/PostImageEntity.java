package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@AllArgsConstructor
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "post_image",
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
            nullable = false
            ,foreignKey = @ForeignKey(name = "FK_post_image_post")
    )
    private PostEntity post;

    // length를 2000에서 5000으로 늘렸습니다
    @Column(name = "image_url", length = 5000, nullable = false)
    private String imageUrl;

    // nullable 항목 제거
    @Column(name = "sort_order") // 디폴트 0
    private int sortOrder;

    @Column(name = "exif_latitude", precision = 10, scale = 7)
    private BigDecimal exifLatitude;

    @Column(name = "exif_longitude", precision = 10, scale = 7)
    private BigDecimal exifLongitude;

    // 장소별 메모 (게시글 작성 시 각 entry의 note를 개별 저장)
    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    // nullable 항목 제거
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}