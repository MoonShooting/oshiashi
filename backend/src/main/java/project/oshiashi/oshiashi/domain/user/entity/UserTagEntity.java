package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "user_tag"
        /*,uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_user_tag_user_tag",
                        columnNames = {"user_id", "tag_id"}
                )
        },
        indexes = {
                @Index(name = "IX_user_tag_user", columnList = "user_id"),
                @Index(name = "IX_user_tag_tag", columnList = "tag_id")
        }*/
)
public class UserTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_tag_id", nullable = false, updatable = false)
    private Long userTagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_user_tag_user")
    )
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "tag_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_user_tag_tag")
    )
    private TagEntity tag;

    @Column(name = "count", nullable = false) // 디폴트 0
    private int count = 0;

    // artwork 추가
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "artwork_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_user_tag_artwork")
    )
    private ArtworkEntity artwork;
}