package project.oshiashi.oshiashi.domain.artwork.entity;

import jakarta.persistence.*;
import lombok.*;

@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Artwork",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_artwork_title", columnNames = "title")
        },
        indexes = {
                @Index(name = "IX_artwork_type", columnList = "artwork_type_id")
        }
)
public class ArtworkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artwork_id", nullable = false, updatable = false)
    private Long artworkId;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "poster_url", length = 500, nullable = false)
    private String posterUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "spotify_album_id", length = 100)
    private String spotifyAlbumId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "artwork_type_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "FK_artwork_artwork_type")
    )
    private ArtworkTypeEntity artworkType;
}