package project.oshiashi.oshiashi.domain.artwork.entity;

import jakarta.persistence.*;
import lombok.*;

/*
 * 작품 정보를 저장하는 Entity
 *
 * 역할
 * - 영화 / 드라마 / 애니메이션 작품 기본 정보를 저장
 * - 촬영지(Spot), 태그(Tag), 게시글(Post) 등 다른 도메인과 연결되는 기준 데이터
 *
 * 주요 설계
 * - 작품 타입은 ArtworkTypeEntity와 ManyToOne 관계
 * - 포스터 URL은 현재 UI에서 필수로 사용되므로 nullable=false
 * - 작품 제목은 필수값이며 중복 판정은 Service에서 처리
 */
@Getter
/*
* JPA가 Entity 생성 시 기본 생성자가 필요하기 때문에 사용했습니다.
  외부에서 무분별한 new 생성을 막기 위해 protected로 제한했습니다.
* */
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

    /*
     * 작품 PK
     *
     * AUTO_INCREMENT 방식으로 생성되는 기본 키입니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artwork_id", nullable = false, updatable = false)
    private Long artworkId;

    /*
     * 작품 제목
     *
     * - 사용자에게 표시되는 작품 이름
     * - TMDB import 시 title / original_title / name / original_name 중
     *   가능한 값을 사용하여 저장합니다.
     */
    @Column(name = "title", length = 255, nullable = false) // 유니크
    private String title;

    /*
     * 포스터 이미지 URL
     *
     * TMDB API에서 받은 poster_path를
     * image base URL과 결합하여 완전한 URL로 저장합니다.
     *
     * 현재 UI에서 작품 카드에 포스터가 필수로 사용되기 때문에
     * nullable=false로 설정했습니다.
     */
    @Column(name = "poster_url", length = 255, nullable = false)
    private String posterUrl;

    /*
     * 작품 설명
     *
     * TMDB overview 데이터를 저장합니다.
     * 길이가 길 수 있어 TEXT 타입으로 설정했습니다.
     */
    @Column(name = "description", columnDefinition = "TEXT") // DB에서 다음과 같이 정의되어 있슴
    private String description;

    /*
     * Spotify 앨범 ID
     *
     * 작품 OST 연결을 위한 필드입니다.
     * 현재는 선택값이기 때문에 nullable 상태로 두었습니다.
     */
    @Column(name = "spotify_album_id", length = 100) // 디폴트 null
    private String spotifyAlbumId;

    /*
     * 작품 타입 (영화 / 드라마 / 애니메이션 등)
     *
     * 하나의 작품은 하나의 타입을 가집니다.
     * ex)
     * - 영화
     * - 드라마
     * - 애니메이션
     *
     * ManyToOne 관계
     * 여러 작품이 하나의 작품 타입을 공유할 수 있습니다.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "artwork_type_id",
            nullable = false
            ,foreignKey = @ForeignKey(name = "FK_artwork_artwork_type")
    )
    private ArtworkTypeEntity artworkType;

    /*
     * Entity 생성용 정적 팩토리 메서드
     *
     * 이유
     * - 생성 시 필수 필드들을 명확하게 설정하기 위해 사용
     * - new 생성자 대신 의도를 명확하게 표현하기 위함
     *
     * 사용 위치
     * - TMDB import 과정에서 Entity 생성 시 사용
     *
     * Builder 대신 of() 메서드를 사용한 이유 : 필수 필드가 명확하고 생성 로직이 단순하기 때문에 정적 팩토리 메서드를 사용
     */
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