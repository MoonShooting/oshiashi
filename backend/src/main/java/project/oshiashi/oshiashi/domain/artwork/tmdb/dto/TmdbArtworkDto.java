package project.oshiashi.oshiashi.domain.artwork.tmdb.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TmdbArtworkDto {
    private Long id;
    private String title;       // movie
    private String name;        // tv
    private String overview;
    private String poster_path;
    private String media_type;
}