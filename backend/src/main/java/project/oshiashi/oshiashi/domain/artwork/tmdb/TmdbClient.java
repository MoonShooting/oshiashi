package project.oshiashi.oshiashi.domain.artwork.tmdb;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import project.oshiashi.oshiashi.domain.artwork.tmdb.dto.TmdbSearchResponse;

/*
 * TMDB API와 통신하는 전용 Client 클래스
 *
 * 역할
 * - TMDB 검색 API 호출
 * - 영화 / TV 작품 검색 결과를 받아오기
 *
 * 구조
 * ArtworkImportService
 *        ↓
 *      TmdbClient
 *        ↓
 *      TMDB API
 *
 * 즉 Service가 직접 HTTP 호출을 하지 않도록
 * 외부 API 통신을 분리한 클래스입니다.
 */
@Component
@RequiredArgsConstructor
public class TmdbClient {

    /*
     * TMDB API 설정값
     *
     * application.yml 또는 .env 에서 읽어옵니다.
     *
     * 예
     * tmdb.api.key
     * tmdb.api.base-url
     */
    private final TmdbProperties tmdbProperties;

    /*
     * 외부 HTTP API 호출을 위한 Spring 클래스
     *
     * REST API 요청을 보내고
     * 응답 JSON을 Java 객체로 자동 변환합니다.
     */
    private final RestTemplate restTemplate = new RestTemplate();

    /*
     * TMDB 영화 검색 API 호출
     *
     * 예시 요청
     * https://api.themoviedb.org/3/search/movie
     *
     * query
     * - 사용자가 검색한 작품 이름
     * - 예: "스즈메", "너의 이름은"
     *
     * 실제 요청 예
     * https://api.themoviedb.org/3/search/movie?api_key=XXX&query=스즈메&language=ko-KR
     */
    public TmdbSearchResponse searchMovie(String query) {
        /*
         * URI 생성
         *
         * UriComponentsBuilder를 사용해
         * query parameter를 안전하게 조합합니다.
         */
        String url = UriComponentsBuilder
                .fromHttpUrl(tmdbProperties.getBaseUrl() + "/search/movie")
                // TMDB API 인증 키
                .queryParam("api_key", tmdbProperties.getApiKey())
                // 검색할 작품 이름
                .queryParam("query", query)
                // 응답 언어 (한국어)
                .queryParam("language", "ko-KR")
                .build()
                .toUriString();

        /*
         * HTTP GET 요청 전송
         *
         * 응답 JSON → TmdbSearchResponse 객체로 자동 변환됩니다.
         */
        return restTemplate.getForObject(url, TmdbSearchResponse.class);
    }

    /*
     * TMDB TV 시리즈 검색 API 호출
     *
     * 예시 요청
     * https://api.themoviedb.org/3/search/tv
     *
     * movie API와 구조는 같지만
     * TMDB에서 TV 작품은 별도의 endpoint를 사용합니다.
     */
    public TmdbSearchResponse searchTv(String query) {
        String url = UriComponentsBuilder
                .fromHttpUrl(tmdbProperties.getBaseUrl() + "/search/tv")
                .queryParam("api_key", tmdbProperties.getApiKey())
                .queryParam("query", query)
                .queryParam("language", "ko-KR")
                .build()
                .toUriString();

        return restTemplate.getForObject(url, TmdbSearchResponse.class);
    }
}