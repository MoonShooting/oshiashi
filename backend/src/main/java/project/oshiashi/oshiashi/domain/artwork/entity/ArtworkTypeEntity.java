package project.oshiashi.oshiashi.domain.artwork.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(
        name = "Artwork_type",
        uniqueConstraints = {
                @UniqueConstraint(name = "UX_artwork_type_name", columnNames = "artwork_type_name")
        }
)
public class ArtworkTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "artwork_type_id", nullable = false, updatable = false)
    private Integer artworkTypeId;

    @Column(name = "artwork_type_name", length = 50, nullable = false)
    private String artworkTypeName;
}