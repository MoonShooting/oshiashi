package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "User_tag",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_user_tag_user_tag",
                        columnNames = {"user_id", "tag_id"}
                )
        },
        indexes = {
                @Index(name = "IX_user_tag_user", columnList = "user_id"),
                @Index(name = "IX_user_tag_tag", columnList = "tag_id")
        }
)
public class UserTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_tag_id", nullable = false, updatable = false)
    private Integer userTagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id", nullable = false)
    private TagEntity tag;

    @Column(name = "count", nullable = false)
    private int count;
}