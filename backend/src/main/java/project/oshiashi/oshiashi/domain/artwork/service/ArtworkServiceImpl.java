package project.oshiashi.oshiashi.domain.artwork.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkTypeResponse;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkTypeRepository;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArtworkServiceImpl implements ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final ArtworkTypeRepository artworkTypeRepository;
    private final SpotRepository spotRepository;

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

    @Override
    public List<ArtworkResponse> getArtworksByType(Long artworkTypeId) {
        return artworkRepository.findByArtworkType_ArtworkTypeId(artworkTypeId).stream()
                .map(ArtworkResponse::fromEntity)
                .toList();
    }

    @Override
    public List<ArtworkTypeResponse> getArtworkTypes() {
        return artworkTypeRepository.findAll().stream()
                .map(ArtworkTypeResponse::from)
                .toList();
    }

    @Override
    public List<SpotResponse> getSpotsByArtwork(Long artworkId) {
        return spotRepository.findByArtwork_ArtworkId(artworkId).stream()
                .map(SpotResponse::fromEntity)
                .toList();
    }
}