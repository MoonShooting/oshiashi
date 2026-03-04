package project.oshiashi.oshiashi.domain.artwork.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.service.ArtworkService;

import java.util.List;

@RestController
@RequestMapping("/api/artworks")
@RequiredArgsConstructor
public class ArtworkController {

    private final ArtworkService artworkService;

    // 전체 조회
    @GetMapping
    public List<ArtworkResponse> getArtworks() {
        return artworkService.getArtworks();
    }

    // 단건 조회
    @GetMapping("/{artworkId}")
    public ArtworkResponse getArtwork(@PathVariable Long artworkId) {
        return artworkService.getArtwork(artworkId);
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