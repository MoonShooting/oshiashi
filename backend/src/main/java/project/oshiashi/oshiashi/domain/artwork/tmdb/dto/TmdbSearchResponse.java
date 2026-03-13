package project.oshiashi.oshiashi.domain.artwork.tmdb.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class TmdbSearchResponse {
    private List<TmdbArtworkDto> results;
}