package project.oshiashi.oshiashi.domain.artwork.tmdb.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class TmdbArtworkDto {

    private Long id; // TMDB 고유 id

    // 영화 제목
    private String title;
    // TMDB는 언어별로 제목이 다르게 내려올 수 있어 원본 제목도 함께 받아둔다.
    private String original_title;

    // TV 제목
    private String name;
    private String original_name;

    private String overview;
    private String poster_path;

    /*
     * 현재 서비스는 movie / tv API를 따로 호출하므로 media_type 없이도 구분 가능하다.
     * 다만 /search/multi API를 사용할 경우 movie, tv, person 등이 함께 내려오므로 필요할 수 있다.
     */
    private String media_type;

    // TMDB 장르 id 목록
    private List<Integer> genre_ids;
}