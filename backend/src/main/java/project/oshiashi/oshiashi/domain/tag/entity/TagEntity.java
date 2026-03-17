package project.oshiashi.oshiashi.domain.tag.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor // 빌더를 사용하기 위해
@Builder             // 빌더
@Entity
@Table(
        name = "tag",
        // DB는 tag_name 단독 UNIQUE+NULL 가능(여러 NULL은 허용될 수 있음), 따라서 복합 유니크 주석 처리
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "tag_name")
        }
        /*
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_tag_artwork_name",
                        columnNames = {"artwork_id", "tag_name"}
                )
        },
        indexes = {
                @Index(name = "IX_tag_artwork", columnList = "artwork_id"),
                @Index(name = "IX_tag_name", columnList = "tag_name")
        }*/
)
public class TagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id", nullable = false, updatable = false)
    private Long tagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // foreign 키 설정
    @JoinColumn(name = "artwork_id", nullable = false)
    private ArtworkEntity artwork;

    @Column(name = "tag_name", length = 100, nullable = false, unique = true) // 유니크 추가
    private String tagName;

    /**
     * TagEntity 객체를 생성하는 생성자입니다.
     */
    public TagEntity(ArtworkEntity artwork, String cleanName) {
        this.artwork = artwork; // 타입이 ArtworkEntity, 전달받은 'artwork' 객체를 엔티티 내부의 'artwork' 필드에 대입합니다.
        this.tagName = cleanName; // 가공(Trim, 소문자화)된 태그 이름인 'cleanName' 을 엔티티의 'tagName' 필드에 대입합니다.
    }
}