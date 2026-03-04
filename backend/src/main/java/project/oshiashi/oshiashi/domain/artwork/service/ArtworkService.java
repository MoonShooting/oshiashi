package project.oshiashi.oshiashi.domain.artwork.service;

import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;

import java.util.List;

public interface ArtworkService {

    List<ArtworkResponse> getArtworks();

    ArtworkResponse getArtwork(Long artworkId);

}