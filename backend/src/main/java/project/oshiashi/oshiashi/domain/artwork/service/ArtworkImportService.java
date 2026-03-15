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

/*
 Impl로 분리하지 않은 이유
 - ArtworkImportService는 외부 API 호출 + DB 저장을 담당하는 내부 로직 서비스
 - 외부에서 확장하거나 교체될 가능성이 거의 없어 인터페이스 분리가 필요하지 않다고 판단
 */

@Service
@RequiredArgsConstructor
@Transactional
public class ArtworkImportService {

    // TMDB에서 Animation 장르 id (공식적으로 16)
    private static final int TMDB_ANIMATION_GENRE_ID = 16;

    private final TmdbClient tmdbClient;
    private final TmdbProperties tmdbProperties;
    private final ArtworkRepository artworkRepository;
    private final ArtworkTypeRepository artworkTypeRepository;

    /*
     movie 검색 API 호출
     기존 구조는 검색 결과를 전부 "영화" 타입으로 저장했지만
     실제로는 애니메이션 영화가 포함될 수 있기 때문에
     결과별 장르를 확인하여 타입을 분기하도록 수정
     */
    public List<Long> importMovies(String query) {
        TmdbSearchResponse response = tmdbClient.searchMovie(query);
        return saveMovieResults(response);
    }

    /*
     tv 검색 API 호출

     TMDB 구조상 애니메이션 시리즈도 tv 검색 결과에 포함될 수 있기 때문에
     장르 정보를 기반으로 "애니메이션" / "드라마" 타입을 분기한다.
     */
    public List<Long> importTv(String query) {
        TmdbSearchResponse response = tmdbClient.searchTv(query);
        return saveTvResults(response);
    }


    /*
     Movie 검색 결과 저장

     주요 처리
     1. TMDB id 기준 중복 체크
     2. 포스터 없는 작품 제외
     3. Animation 장르 여부에 따라 타입 분기
     */
    private List<Long> saveMovieResults(TmdbSearchResponse response) {

        List<Long> savedIds = new ArrayList<>();

        // 응답이 없거나 결과가 없는 경우 바로 종료
        if (response == null || response.getResults() == null) {
            return savedIds;
        }

        /*
         반복문마다 DB 조회를 하지 않도록
         ArtworkType을 미리 조회해 둔다.
         */
        ArtworkTypeEntity movieType = getArtworkType("영화");
        ArtworkTypeEntity animationType = getArtworkType("애니메이션");

        for (TmdbArtworkDto dto : response.getResults()) {

            // TMDB id가 없는 데이터는 저장하지 않음
            if (dto.getId() == null) {
                continue;
            }

            // movie의 제목은 title
            String resolvedTitle = resolveMovieTitle(dto);

            if (resolvedTitle == null || resolvedTitle.isBlank()) {
                continue;
            }

            // 포스터 없는 작품은 제외 (UI 표시 목적)
            if (dto.getPoster_path() == null || dto.getPoster_path().isBlank()) {
                continue;
            }

            /*
             중복 체크
             title 기준이 아닌 TMDB 고유 id 기준으로 확인
             - 번역 제목 차이
             - 동명 작품
             - 영화/드라마 제목 충돌
             등의 문제 방지
             */
            if (artworkRepository.existsByTmdbId(dto.getId())) {
                continue;
            }

            // Animation 장르 여부에 따라 타입 결정
            ArtworkTypeEntity artworkType =
                    isAnimation(dto) ? animationType : movieType;

            String posterUrl = buildPosterUrl(dto.getPoster_path());

            ArtworkEntity artwork = ArtworkEntity.of(
                    dto.getId(),
                    resolvedTitle,
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


    /*
     TV 검색 결과 저장

     tv API의 경우 name 필드를 제목으로 사용
     */
    private List<Long> saveTvResults(TmdbSearchResponse response) {

        List<Long> savedIds = new ArrayList<>();

        if (response == null || response.getResults() == null) {
            return savedIds;
        }

        ArtworkTypeEntity dramaType = getArtworkType("드라마");
        ArtworkTypeEntity animationType = getArtworkType("애니메이션");

        for (TmdbArtworkDto dto : response.getResults()) {

            if (dto.getId() == null) {
                continue;
            }

            /*
             TMDB는
             movie → title
             tv → name

             우리 서비스에서는 둘 다 하나의 title 컬럼에 저장한다.
             */
            String resolvedTitle = resolveTvTitle(dto);

            if (resolvedTitle == null || resolvedTitle.isBlank()) {
                continue;
            }

            if (dto.getPoster_path() == null || dto.getPoster_path().isBlank()) {
                continue;
            }

            if (artworkRepository.existsByTmdbId(dto.getId())) {
                continue;
            }

            ArtworkTypeEntity artworkType =
                    isAnimation(dto) ? animationType : dramaType;

            String posterUrl = buildPosterUrl(dto.getPoster_path());

            ArtworkEntity artwork = ArtworkEntity.of(
                    dto.getId(),
                    resolvedTitle,
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


    /*
     Movie 제목 처리

     TMDB는 언어 설정에 따라
     title이 없고 original_title만 내려오는 경우가 있어
     fallback 처리를 한다.
     */
    private String resolveMovieTitle(TmdbArtworkDto dto) {

        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            return dto.getTitle();
        }

        return dto.getOriginal_title();
    }


    /*
     TV 제목 처리
     */
    private String resolveTvTitle(TmdbArtworkDto dto) {

        if (dto.getName() != null && !dto.getName().isBlank()) {
            return dto.getName();
        }

        return dto.getOriginal_name();
    }


    /*
     Animation 장르 여부 확인

     TMDB 장르 id
     16 = Animation
     */
    private boolean isAnimation(TmdbArtworkDto dto) {

        return dto.getGenre_ids() != null
                && dto.getGenre_ids().contains(TMDB_ANIMATION_GENRE_ID);
    }


    /*
     ArtworkType 조회

     DB에 정의된 타입명을 기준으로 조회한다.
     */
    private ArtworkTypeEntity getArtworkType(String typeName) {

        return artworkTypeRepository.findByArtworkTypeName(typeName)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "ArtworkType을 찾을 수 없습니다: " + typeName
                ));
    }


    /*
     TMDB 포스터 URL 생성

     예시
     https://image.tmdb.org/t/p/w500/xxxxx.jpg
     */
    private String buildPosterUrl(String posterPath) {
        return tmdbProperties.getImageBaseUrl() + "w500" + posterPath;
    }
}