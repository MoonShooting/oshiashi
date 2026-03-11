package project.oshiashi.oshiashi.domain.artwork.service;

import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkTypeResponse;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;

import java.util.List;

public interface ArtworkService {

    // Service를 interface + impl로 분리
    // Controller는 인터페이스에 의존하고
    // 실제 비즈니스 로직은 Impl에서 구현하도록 설계

    List<ArtworkResponse> getArtworks();

    ArtworkResponse getArtwork(Long artworkId);

    List<ArtworkResponse> getArtworksByType(Long artworkTypeId);

    List<ArtworkTypeResponse> getArtworkTypes();

    List<SpotResponse> getSpotsByArtwork(Long artworkId);

}