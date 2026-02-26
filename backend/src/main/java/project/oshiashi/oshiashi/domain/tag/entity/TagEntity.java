package project.oshiashi.oshiashi.domain.tag.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Tag",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_tag_artwork_name",
                        columnNames = {"artwork_id", "tag_name"}
                )
        },
        indexes = {
                @Index(name = "IX_tag_artwork", columnList = "artwork_id"),
                @Index(name = "IX_tag_name", columnList = "tag_name")
        }
)
public class TagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tag_id", nullable = false, updatable = false)
    private Long tagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "artwork_id", nullable = false)
    private ArtworkEntity artwork;

    @Column(name = "tag_name", length = 100, nullable = false)
    private String tagName;
}