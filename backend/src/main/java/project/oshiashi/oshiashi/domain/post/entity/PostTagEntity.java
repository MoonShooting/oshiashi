package project.oshiashi.oshiashi.domain.post.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// @Entity // GPT 이자식!!! 없는 테이블을 찾도록 하다니!!! 따라서 죽였습니다
@Table(
        name = "post_tag",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_post_tag_post_tag",
                        columnNames = {"post_id", "tag_id"}
                )
        },
        indexes = {
                @Index(name = "IX_post_tag_post", columnList = "post_id"),
                @Index(name = "IX_post_tag_tag", columnList = "tag_id")
        }
)
public class PostTagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_tag_id", nullable = false, updatable = false)
    private Long postTagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private PostEntity post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tag_id", nullable = false)
    private TagEntity tag;
}