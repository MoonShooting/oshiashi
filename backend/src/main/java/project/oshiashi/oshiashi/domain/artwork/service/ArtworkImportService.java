package project.oshiashi.oshiashi.domain.artwork.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkTypeEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkTypeRepository;
import project.oshiashi.oshiashi.domain.artwork.tmdb.TmdbClient;
import project.oshiashi.oshiashi.domain.artwork.tmdb.TmdbProperties;
import project.oshiashi.oshiashi.domain.artwork.tmdb.dto.TmdbArtworkDto;
import project.oshiashi.oshiashi.domain.artwork.tmdb.dto.TmdbSearchResponse;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.util.ArrayList;
import java.util.List;

// Impl로 분리 안 한 이유는 “인터페이스가 필요 없는 서비스”이기 때문
// ArtworkImportService는 외부 API 호출 + DB 저장을 한 번에 처리하는 내부 로직 서비스라서 굳이 인터페이스를 둘 이유가 없음.

@Service
@RequiredArgsConstructor
@Transactional
public class ArtworkImportService {

    private final TmdbClient tmdbClient;
    private final TmdbProperties tmdbProperties;
    private final ArtworkRepository artworkRepository;
    private final ArtworkTypeRepository artworkTypeRepository;

    public List<Long> importMovies(String query) {
        TmdbSearchResponse response = tmdbClient.searchMovie(query);
        ArtworkTypeEntity artworkType = getArtworkType("영화");

        return saveResults(response, artworkType, true);
    }

    public List<Long> importTv(String query) {
        TmdbSearchResponse response = tmdbClient.searchTv(query);
        ArtworkTypeEntity artworkType = getArtworkType("드라마");

        return saveResults(response, artworkType, false);
    }

    private List<Long> saveResults(TmdbSearchResponse response, ArtworkTypeEntity artworkType, boolean movie) {
        List<Long> savedIds = new ArrayList<>();

        if (response == null || response.getResults() == null) {
            return savedIds;
        }

        for (TmdbArtworkDto dto : response.getResults()) {
            String title = movie ? dto.getTitle() : dto.getName();

            if (title == null || title.isBlank()) {
                continue;
            }

            if (dto.getPoster_path() == null || dto.getPoster_path().isBlank()) {
                continue;
            }

            if (artworkRepository.existsByTitle(title)) {
                continue;
            }

            String posterUrl = buildPosterUrl(dto.getPoster_path());

            ArtworkEntity artwork = ArtworkEntity.of(
                    title,
                    posterUrl,
                    dto.getOverview(),
                    null,
                    artworkType
            );

            ArtworkEntity saved = artworkRepository.save(artwork);
            savedIds.add(saved.getArtworkId());
        }

        return savedIds;
    }

    private ArtworkTypeEntity getArtworkType(String typeName) {
        return artworkTypeRepository.findByArtworkTypeName(typeName)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "ArtworkType을 찾을 수 없습니다: " + typeName
                ));
    }

    private String buildPosterUrl(String posterPath) {
        return tmdbProperties.getImageBaseUrl() + "w500" + posterPath;
    }
}