package project.oshiashi.oshiashi.domain.artwork.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class ArtworkResolveService {

    private final ArtworkRepository artworkRepository;
    private final ArtworkImportService artworkImportService;

    /*
     * 작품 조회 후 없으면 TMDB에서 가져와 저장한다.
     * 현재는 제목 기준으로 재조회하지만,
     * 내부 저장 시에는 tmdbId 기준 중복 체크가 이미 적용되어 있다.
     */
    public ArtworkEntity getOrCreateArtwork(String artworkTitle) {

        return artworkRepository.findByTitle(artworkTitle)
                .orElseGet(() -> {
                    // 영화 / TV 둘 다 조회해서 DB에 저장 시도
                    artworkImportService.importMovies(artworkTitle);
                    artworkImportService.importTv(artworkTitle);

                    // import 후 다시 조회
                    return artworkRepository.findByTitle(artworkTitle)
                            .orElseThrow(() -> new IllegalArgumentException("작품을 찾을 수 없습니다: " + artworkTitle));
                });
    }
}