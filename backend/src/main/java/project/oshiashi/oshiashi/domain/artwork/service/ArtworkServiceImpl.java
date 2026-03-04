package project.oshiashi.oshiashi.domain.artwork.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtworkServiceImpl implements ArtworkService {

    private final ArtworkRepository artworkRepository;

    @Override
    public List<ArtworkResponse> getArtworks() {
        return artworkRepository.findAll().stream()
                .map(ArtworkResponse::fromEntity)
                .toList();
    }

    @Override
    public ArtworkResponse getArtwork(Long artworkId) {
        ArtworkEntity artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));

        return ArtworkResponse.fromEntity(artwork);
    }
}