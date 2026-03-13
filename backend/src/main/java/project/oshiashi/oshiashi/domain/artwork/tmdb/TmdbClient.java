package project.oshiashi.oshiashi.domain.artwork.tmdb;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import project.oshiashi.oshiashi.domain.artwork.tmdb.dto.TmdbSearchResponse;

@Component
@RequiredArgsConstructor
public class TmdbClient {

    private final TmdbProperties tmdbProperties;
    private final RestTemplate restTemplate = new RestTemplate();

    public TmdbSearchResponse searchMovie(String query) {
        String url = UriComponentsBuilder
                .fromHttpUrl(tmdbProperties.getBaseUrl() + "/search/movie")
                .queryParam("api_key", tmdbProperties.getApiKey())
                .queryParam("query", query)
                .queryParam("language", "ko-KR")
                .build()
                .toUriString();

        return restTemplate.getForObject(url, TmdbSearchResponse.class);
    }

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