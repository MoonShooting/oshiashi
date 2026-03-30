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
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ExternalArtworkCandidateResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ExternalArtworkSaveRequest;
import java.util.Comparator;
import java.util.concurrent.CompletableFuture;

import java.util.ArrayList;
import java.util.List;

/* ArtworkImportService는 일반 ArtworkService와 역할이 다르기 때문에 분리했습니다.
   - ArtworkService : 사용자 API 기반 작품 조회 로직 담당
   - ArtworkImportService : TMDB 외부 API를 호출하여 작품 데이터를 가져와 DB에 저장하는 역할
   - 즉 조회 기능과 외부 데이터 적재 기능의 책임을 분리하기 위해 별도 서비스로 구성했습니다.

   - 이 서비스는 외부 API(TMDB) 데이터를 내부 DB에 저장하는 내부 로직이므로
   - 별도의 요청/응답 DTO를 만들지 않았습니다.

   - TMDB 응답을 매핑하는 TmdbArtworkDto를 그대로 가공하여 Entity로 변환하는 구조로 구현했습니다.
   - ArtworkImportService는 외부 API 데이터를 적재하는 내부 전용 서비스입니다.
   - 현재 단일 구현만 존재하고 다른 구현체로 교체할 가능성이 낮기 때문에 인터페이스를 분리하지 않고 단일 Service 클래스로 구현했습니다*/
@Service
@RequiredArgsConstructor
@Transactional
public class ArtworkImportService {

    /*
     * TMDB에서 애니메이션 장르 id는 16으로 고정되어 있습니다.
     * movie / tv 응답에서 genre_ids를 확인해 작품 타입을 분류할 때 사용합니다.
     */
    private static final int TMDB_ANIMATION_GENRE_ID = 16;

    private final TmdbClient tmdbClient;
    private final TmdbProperties tmdbProperties;
    private final ArtworkRepository artworkRepository;
    private final ArtworkTypeRepository artworkTypeRepository;

    /*
     * 영화 검색 API를 호출한 뒤, 영화 결과를 저장합니다.
     * movie API는 title 필드를 사용하므로 movie 전용 저장 로직으로 분리했습니다.
     */
    public List<Long> importMovies(String query) {
        TmdbSearchResponse response = tmdbClient.searchMovie(query);
        return saveMovieResults(response);
    }

    /*
     * TV 검색 API를 호출한 뒤, TV 결과를 저장합니다.
     * tv API는 name 필드를 사용하므로 tv 전용 저장 로직으로 분리했습니다.
     */
    public List<Long> importTv(String query) {
        TmdbSearchResponse response = tmdbClient.searchTv(query);
        return saveTvResults(response);
    }


    /*
     * movie 검색 결과를 우리 DB에 저장하는 메서드입니다.
     *
     * 주요 처리 순서
     * 1. 응답이 비어 있으면 종료
     * 2. 작품 타입(영화/애니메이션) 미리 조회
     * 3. 제목 보정 및 정규화
     * 4. 포스터 없는 데이터 제외
     * 5. title + artworkType 기준 중복 체크
     * 6. Entity로 변환 후 저장
     */
    private List<Long> saveMovieResults(TmdbSearchResponse response) {
        List<Long> savedIds = new ArrayList<>();

        // 응답 자체가 없거나 결과 목록이 없으면 저장할 데이터가 없으므로 빈 리스트 반환
        if (response == null || response.getResults() == null) {
            return savedIds;
        }

        /*
         * 반복문 안에서 매번 DB 조회하지 않도록
         * 필요한 작품 타입을 한 번만 조회해서 재사용합니다.
         */
        ArtworkTypeEntity movieType = getArtworkType("영화");
        ArtworkTypeEntity animationType = getArtworkType("애니메이션");

        /*
         * TMDB 응답의 movie 제목은 title을 우선 사용하고,
         * 없으면 original_title을 fallback으로 사용합니다.
         * 이후 공백 차이를 줄이기 위해 normalizeTitle로 정규화합니다.
         */
        for (TmdbArtworkDto dto : response.getResults()) {
            String resolvedTitle = normalizeTitle(resolveMovieTitle(dto));

            // 제목이 끝까지 비어 있으면 저장 의미가 없으므로 제외
            if (resolvedTitle == null) {
                continue;
            }

            /*
             * 현재 UI에서 작품 목록/카드에 포스터가 중요하므로
             * poster_path가 없는 데이터는 저장 대상에서 제외합니다.
             * 또한 DB에서도 poster_url은 필수값으로 사용 중입니다.
             */
            if (dto.getPoster_path() == null || dto.getPoster_path().isBlank()) {
                continue;
            }

            /*
             * 장르 id에 16이 포함되어 있으면 애니메이션으로 분류,
             * 아니면 일반 영화로 분류합니다.
             */
            ArtworkTypeEntity artworkType = isAnimation(dto) ? animationType : movieType;

            /*
             * 현재 DB에는 TMDB 고유 id 컬럼이 없기 때문에
             * 내부 기준인 title + artworkType 조합으로 중복을 검사합니다.
             *
             * 같은 제목이라도 영화/드라마/애니메이션 타입이 다르면
             * 다른 작품으로 볼 수 있어 title 단독이 아닌 복합 기준을 사용했습니다.
             */
            if (artworkRepository.existsByTitleAndArtworkType_ArtworkTypeId(
                    resolvedTitle,
                    artworkType.getArtworkTypeId()
            )) {
                continue;
            }

            // TMDB의 poster_path를 실제 이미지 URL로 조합합니다.
            String posterUrl = buildPosterUrl(dto.getPoster_path());

            // TMDB 응답 데이터를 우리 Entity 구조에 맞게 변환합니다.
            ArtworkEntity artwork = ArtworkEntity.of(
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
     * tv 검색 결과를 저장하는 메서드입니다.
     * 구조는 movie와 거의 같지만, 제목 필드가 name / original_name이라는 점이 다릅니다.
     */
    private List<Long> saveTvResults(TmdbSearchResponse response) {
        List<Long> savedIds = new ArrayList<>();

        if (response == null || response.getResults() == null) {
            return savedIds;
        }

        ArtworkTypeEntity dramaType = getArtworkType("드라마");
        ArtworkTypeEntity animationType = getArtworkType("애니메이션");

        for (TmdbArtworkDto dto : response.getResults()) {
            /*
             * tv 응답은 title이 아니라 name을 사용하므로
             * tv 전용 제목 처리 메서드를 사용합니다.
             */
            String resolvedTitle = normalizeTitle(resolveTvTitle(dto));

            if (resolvedTitle == null) {
                continue;
            }

            if (dto.getPoster_path() == null || dto.getPoster_path().isBlank()) {
                continue;
            }

            ArtworkTypeEntity artworkType = isAnimation(dto) ? animationType : dramaType;

            if (artworkRepository.existsByTitleAndArtworkType_ArtworkTypeId(
                    resolvedTitle,
                    artworkType.getArtworkTypeId()
            )) {
                continue;
            }

            String posterUrl = buildPosterUrl(dto.getPoster_path());

            ArtworkEntity artwork = ArtworkEntity.of(
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
     * movie 제목 보정 메서드
     *
     * 우선순위
     * 1. title
     * 2. original_title
     *
     * 이유
     * - TMDB는 언어/데이터 상태에 따라 title이 비어 있을 수 있어
     *   fallback 처리가 필요합니다.
     */
    private String resolveMovieTitle(TmdbArtworkDto dto) {
        if (dto.getTitle() != null && !dto.getTitle().isBlank()) {
            return dto.getTitle();
        }

        // DB에 별도 컬럼은 없지만, title이 비어 있는 경우 fallback 용도로만 사용합니다.
        if (dto.getOriginal_title() != null && !dto.getOriginal_title().isBlank()) {
            return dto.getOriginal_title();
        }

        return null;
    }

    /*
     * tv 제목 보정 메서드
     *
     * 우선순위
     * 1. name
     * 2. original_name
     */
    private String resolveTvTitle(TmdbArtworkDto dto) {
        if (dto.getName() != null && !dto.getName().isBlank()) {
            return dto.getName();
        }

        if (dto.getOriginal_name() != null && !dto.getOriginal_name().isBlank()) {
            return dto.getOriginal_name();
        }

        return null;
    }

    /*
     * TMDB 장르 목록에 애니메이션 id(16)가 포함되어 있는지 검사합니다.
     * 이를 기준으로 애니메이션 / 영화 / 드라마 타입 분기에 사용합니다.
     */
    private boolean isAnimation(TmdbArtworkDto dto) {
        return dto.getGenre_ids() != null
                && dto.getGenre_ids().contains(TMDB_ANIMATION_GENRE_ID);
    }

    /*
     * DB에 미리 저장된 작품 타입(영화, 드라마, 애니메이션)을 조회합니다.
     * 타입명이 없으면 현재 로직으로는 저장이 불가능하므로 예외를 발생시킵니다.
     */
    private ArtworkTypeEntity getArtworkType(String typeName) {
        return artworkTypeRepository.findByArtworkTypeName(typeName)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND,
                        "ArtworkType을 찾을 수 없습니다: " + typeName
                ));
    }

    /*
     * TMDB에서 내려주는 poster_path는 전체 URL이 아니므로
     * 이미지 base URL + 사이즈(w500) + path를 합쳐 완전한 URL로 만듭니다.
     */
    private String buildPosterUrl(String posterPath) {
        return tmdbProperties.getImageBaseUrl() + "w500" + posterPath;
    }

    /*
     * 제목 비교 시 공백 차이로 중복 판정이 흔들리지 않도록 정규화합니다.
     *
     * 예시
     * "  너의   이름은 " -> "너의 이름은"
     */
    private String normalizeTitle(String title) {
        if (title == null) {
            return null;
        }

        // 제목 비교 시 공백 차이 때문에 중복 판정이 흔들리지 않도록 정규화합니다.
        String normalized = title.trim().replaceAll("\\s+", " ");
        return normalized.isBlank() ? null : normalized;
    }


    // ── 성능 최적화: TMDB 영화/TV 검색을 병렬로 호출 ──
    // 기존: searchMovie → searchTv 순차 호출 = ~800ms
    // 개선: 두 호출을 CompletableFuture로 병렬화 = ~400ms (절반)
    public List<ExternalArtworkCandidateResponse> searchExternal(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        // 영화 + TV 검색을 동시에 실행
        CompletableFuture<TmdbSearchResponse> movieFuture =
                CompletableFuture.supplyAsync(() -> tmdbClient.searchMovie(query));
        CompletableFuture<TmdbSearchResponse> tvFuture =
                CompletableFuture.supplyAsync(() -> tmdbClient.searchTv(query));

        // 두 결과를 합산
        TmdbSearchResponse movieResponse = movieFuture.join();
        TmdbSearchResponse tvResponse = tvFuture.join();

        List<ExternalArtworkCandidateResponse> candidates = new ArrayList<>();
        candidates.addAll(mapMovieCandidates(movieResponse));
        candidates.addAll(mapTvCandidates(tvResponse));

        return candidates.stream()
                .filter(candidate -> candidate.getTitle() != null)
                .sorted(Comparator.comparing(ExternalArtworkCandidateResponse::getTitle))
                .toList();
    }

    // 사용자가 고른 TMDB 후보 1건을 Artwork로 저장하고, 이후 Tag 생성 등에 쓸 artworkId를 반환합니다.
    public ArtworkResponse saveSelectedArtwork(ExternalArtworkSaveRequest request) {
        String resolvedTitle = normalizeTitle(request.getTitle());

        // Artwork.title은 필수값이므로 저장 전에 제목이 비어 있지 않은지 확인합니다.
        if (resolvedTitle == null) {
            throw new BusinessException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "작품 제목은 필수입니다."
            );
        }

        // 현재 Artwork는 poster_url을 필수로 사용하므로, 포스터 경로가 없으면 저장하지 않습니다.
        if (request.getPosterPath() == null || request.getPosterPath().isBlank()) {
            throw new BusinessException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "포스터 경로는 필수입니다."
            );

        }

        ArtworkTypeEntity artworkType = resolveArtworkType(
                request.getMediaType(),
                request.getGenreIds()
        );

        // 같은 작품이 중복 저장되지 않도록 title + artworkType 기준으로 먼저 확인합니다.
        return artworkRepository
                .findByTitleAndArtworkType_ArtworkTypeId(
                        resolvedTitle,
                        artworkType.getArtworkTypeId()
                )
                .map(ArtworkResponse::fromEntity)
                .orElseGet(() -> {
                    ArtworkEntity artwork = ArtworkEntity.of(
                            resolvedTitle,
                            buildPosterUrl(request.getPosterPath()),
                            request.getOverview(),
                            null,
                            artworkType
                    );
                    return ArtworkResponse.fromEntity(artworkRepository.save(artwork));
                });
    }


    // TMDB 영화 검색 결과를 프론트에 보여줄 후보 목록 형태로 변환합니다.
    private List<ExternalArtworkCandidateResponse> mapMovieCandidates(TmdbSearchResponse response) {
        if (response == null || response.getResults() == null) {
            return List.of();
        }

        return response.getResults().stream()
                .map(dto -> ExternalArtworkCandidateResponse.builder()
                        .title(normalizeTitle(resolveMovieTitle(dto)))
                        .overview(dto.getOverview())
                        .posterPath(dto.getPoster_path())
                        .posterUrl(dto.getPoster_path() == null || dto.getPoster_path().isBlank()
                                ? null
                                : buildPosterUrl(dto.getPoster_path()))
                        .mediaType("MOVIE")
                        .genreIds(dto.getGenre_ids())
                        .build())
                .filter(candidate -> candidate.getTitle() != null)
                .toList();
    }

    // TMDB TV 검색 결과를 프론트에 보여줄 후보 목록 형태로 변환합니다.
    private List<ExternalArtworkCandidateResponse> mapTvCandidates(TmdbSearchResponse response) {
        if (response == null || response.getResults() == null) {
            return List.of();
        }

        return response.getResults().stream()
                .map(dto -> ExternalArtworkCandidateResponse.builder()
                        .title(normalizeTitle(resolveTvTitle(dto)))
                        .overview(dto.getOverview())
                        .posterPath(dto.getPoster_path())
                        .posterUrl(dto.getPoster_path() == null || dto.getPoster_path().isBlank()
                                ? null
                                : buildPosterUrl(dto.getPoster_path()))
                        .mediaType("TV")
                        .genreIds(dto.getGenre_ids())
                        .build())
                .filter(candidate -> candidate.getTitle() != null)
                .toList();
    }

    // TMDB mediaType과 장르 정보를 바탕으로 내부 ArtworkType을 결정합니다.
    private ArtworkTypeEntity resolveArtworkType(String mediaType, List<Integer> genreIds) {
        boolean animation = genreIds != null && genreIds.contains(TMDB_ANIMATION_GENRE_ID);

        // animation 장르가 있으면 movie/tv보다 우선해서 애니메이션으로 분류합니다.
        if (animation) {
            return getArtworkType("애니메이션");
        }

        if ("TV".equalsIgnoreCase(mediaType)) {
            return getArtworkType("드라마");
        }

        return getArtworkType("영화");
    }

}
