package project.oshiashi.oshiashi.domain.artwork.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ExternalArtworkCandidateResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ExternalArtworkSaveRequest;
import project.oshiashi.oshiashi.domain.artwork.service.ArtworkImportService;

import java.util.List;

// 내부 DB에 없는 작품을 TMDB에서 찾고, 사용자가 고른 결과를 Artwork로 저장하기 위한 컨트롤러
@RestController
@RequestMapping("/api/v1/artworks")
@RequiredArgsConstructor
public class ArtworkSearchController {

    private final ArtworkImportService artworkImportService;

    // movie / tv를 따로 부르지 않고, 검색 후보를 한 번에 모아 프론트에 반환합니다.
    @GetMapping("/search/external")
    public List<ExternalArtworkCandidateResponse> searchExternal(@RequestParam String query) {
        return artworkImportService.searchExternal(query);
    }

    // 프론트가 사용자가 선택한 TMDB 결과 1건만 보내면, 이를 실제 Artwork로 저장합니다.
    @PostMapping("/import")
    public ArtworkResponse importSelectedArtwork(@RequestBody ExternalArtworkSaveRequest request) {
        return artworkImportService.saveSelectedArtwork(request);
    }
}
