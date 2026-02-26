package project.oshiashi.oshiashi.domain.spot.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Spot",
        uniqueConstraints = {
                // 작품 내에서 같은 장소명이 중복되는 걸 막고 싶으면 유지 (원치 않으면 삭제)
                @UniqueConstraint(name = "UX_spot_artwork_name", columnNames = {"artwork_id", "name"})
        },
        indexes = {
                @Index(name = "IX_spot_artwork", columnList = "artwork_id"),
                @Index(name = "IX_spot_lat_lng", columnList = "latitude,longitude")
        }
)
public class SpotEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "spot_id", nullable = false, updatable = false)
    private Long spotId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "artwork_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_spot_artwork")
    )
    private ArtworkEntity artwork;

    @Column(name = "name", length = 255, nullable = false)
    private String name;

    /**
     * 위도/경도는 일반적으로 다음이 많이 쓰임:
     * - latitude:  DECIMAL(10,7)  -> -90.0000000 ~ 90.0000000
     * - longitude: DECIMAL(10,7)  -> -180.0000000 ~ 180.0000000
     */
    @Column(name = "latitude", precision = 10, scale = 7, nullable = false) // 여기야!!!!!!!
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7, nullable = false) // 여기야!!!!!!!
    private BigDecimal longitude;

    @Column(name = "address", length = 300) // 여기야 !!!!!!!!!!!
    private String address;

    /**
     * sceneImgUrl을 unique로 두면:
     * - 서로 다른 스팟이 같은 이미지 URL을 공유하면 저장이 막힘
     * 실제로 그럴 수 있으면 unique 제거 추천.
     */
    @Column(name = "scene_image_url", length = 500)
    private String sceneImgUrl;
}