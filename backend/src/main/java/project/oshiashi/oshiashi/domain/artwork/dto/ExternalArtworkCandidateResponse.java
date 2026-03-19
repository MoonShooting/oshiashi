package project.oshiashi.oshiashi.domain.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// TMDB 검색 결과를 프론트에 후보 목록으로 내려주기 위한 응답 DTO
// 사용자가 이 목록 중 하나를 선택하면 이후 Artwork 저장 API로 넘깁니다.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalArtworkCandidateResponse {
    private String title; // 프론트에 보여줄 최종 작품명
    private String overview;
    private String posterPath;
    private String posterUrl; // 바로 화면에 쓸 수 있게 조합된 포스터 URL
    private String mediaType; // Movie / Tv 구분
    private List<Integer> genreIds;
}
