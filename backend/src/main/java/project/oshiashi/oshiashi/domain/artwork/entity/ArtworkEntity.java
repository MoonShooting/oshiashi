package project.oshiashi.oshiashi.domain.artwork.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "artwork"
        // title UNIQUE 없음에따라 주석처리
        /*,
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UX_artwork_title", columnNames = "title")
        },
        indexes = {
                @Index(name = "IX_artwork_type", columnList = "artwork_type_id")
        }*/
)
public class ArtworkEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artwork_id", nullable = false, updatable = false)
    private Long artworkId;

    @Column(name = "title", length = 255, nullable = false) // 유니크
    private String title;

    // nullable 제거
    @Column(name = "poster_url", length = 255, nullable = false)
    private String posterUrl;

    @Column(name = "description", columnDefinition = "TEXT") // DB에서 다음과 같이 정의되어 있슴
    private String description;

    @Column(name = "spotify_album_id", length = 100) // 디폴트 null
    private String spotifyAlbumId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "artwork_type_id",
            nullable = false
            ,foreignKey = @ForeignKey(name = "FK_artwork_artwork_type")
    )
    private ArtworkTypeEntity artworkType;

    // tmdb 값을 저장하기 위한 정적 메서드(builder 안써도 됨)
    public static ArtworkEntity of(
            String title,
            String posterUrl,
            String description,
            String spotifyAlbumId,
            ArtworkTypeEntity artworkType
    ) {
        ArtworkEntity entity = new ArtworkEntity();
        entity.title = title;
        entity.posterUrl = posterUrl;
        entity.description = description;
        entity.spotifyAlbumId = spotifyAlbumId;
        entity.artworkType = artworkType;
        return entity;
    }
}