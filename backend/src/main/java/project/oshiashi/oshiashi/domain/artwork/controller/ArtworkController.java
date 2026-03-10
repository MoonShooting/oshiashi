package project.oshiashi.oshiashi.domain.artwork.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkTypeResponse;
import project.oshiashi.oshiashi.domain.artwork.service.ArtworkService;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/main")
@RequiredArgsConstructor
public class ArtworkController {

    private final ArtworkService artworkService;

    // 전체 조회
    @GetMapping
    public List<ArtworkResponse> getArtworks(
            @RequestParam(required = false) Long artworkTypeId
    ) {
        if (artworkTypeId != null) {
            return artworkService.getArtworksByType(artworkTypeId);
        }
        return artworkService.getArtworks();
    }


    // 단건 조회
    @GetMapping("artwork/{artworkId}")
    public ArtworkResponse getArtwork(@PathVariable Long artworkId) {
        return artworkService.getArtwork(artworkId);
    }

    // 작품별 촬영지 조회
    @GetMapping("artwork/{artworkId}/spots")
    public List<SpotResponse> getSpotsByArtwork(@PathVariable Long artworkId) {
        return artworkService.getSpotsByArtwork(artworkId);
    }

    @GetMapping("artwork/types")
    public List<ArtworkTypeResponse> getArtworkTypes() {
        return artworkService.getArtworkTypes();
    }
    /*
    @GetMapping("/test")
    public List<ArtworkResponse> test() {
        return List.of(
                ArtworkResponse.builder()
                        .artworkId(1L)
                        .title("테스트 작품")
                        .posterUrl("https://example.com/poster.jpg")
                        .description("설명")
                        .spotifyAlbumId("spotify123")
                        .artworkTypeId(1L)
                        .artworkTypeName("애니메이션")
                        .build()
        );
    }*/
}