package project.oshiashi.oshiashi.domain.tag.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Tag",
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
}