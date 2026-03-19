package project.oshiashi.oshiashi.domain.artwork.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// 사용자가 TMDB 검색 결과에서 선택한 1건을 실제 Artwork로 저장할 때 쓰는 요청 DTO
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExternalArtworkSaveRequest {
    private String title;
    private String overview;
    private String posterPath;
    private String mediaType;
    private List<Integer> genreIds;
}
