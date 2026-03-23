package project.oshiashi.oshiashi.domain.artwork.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkResponse;
import project.oshiashi.oshiashi.domain.artwork.dto.ArtworkTypeResponse;
import project.oshiashi.oshiashi.domain.artwork.service.ArtworkService;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.service.PostService;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;

import java.util.List;

/*
 * 작품(Artwork) 관련 조회 API를 제공하는 컨트롤러
 *
 * 역할
 * - 프론트에서 들어온 요청을 받아 Service 계층으로 전달
 * - Service에서 처리된 결과를 DTO 형태로 반환
 *
 * Base URL
 * /api/v1/main
 */
@RestController
@RequestMapping("/api/v1/main")
@RequiredArgsConstructor
public class ArtworkController {

    /*
     * 실제 비즈니스 로직은 Service 계층에서 처리
     * Controller는 요청 전달과 응답 반환 역할만 담당
     */
    private final ArtworkService artworkService;
    private final PostService postService;


    /*
     * 1. 작품 전체 조회
     *
     * GET /api/v1/main/
     *
     * Query Parameter
     * - artworkTypeId (optional)
     *
     * 동작
     * - artworkTypeId가 없으면 → 전체 작품 조회
     * - artworkTypeId가 있으면 → 해당 타입의 작품만 조회
     *
     * 예시
     * /api/v1/main/                → 전체 작품
     * /api/v1/main/?artworkTypeId=1 → 특정 타입 작품
     */
    @GetMapping("/")
    public List<ArtworkResponse> getArtworks(
            @RequestParam(required = false) Long artworkTypeId
    ) {
        // artworkTypeId가 있는 경우
        if (artworkTypeId != null) {
            return artworkService.getArtworksByType(artworkTypeId);
        }

        // 전체 작품 조회
        return artworkService.getArtworks();
    }


    /*
     * 2. 작품 단건 조회
     *
     * GET /api/v1/main/artwork/{artworkId}
     *
     * PathVariable
     * - artworkId : 조회할 작품의 고유 ID
     *
     * 반환
     * - 해당 작품의 상세 정보 (ArtworkResponse)
     */
    @GetMapping("/artwork/{artworkId}")
    public ArtworkResponse getArtwork(@PathVariable Long artworkId) {
        return artworkService.getArtwork(artworkId);
    }

    /*
     * 3. 특정 작품의 촬영지 목록 조회
     *
     * GET /api/v1/main/artwork/{artworkId}/spots
     *
     * PathVariable
     * - artworkId : 작품 ID
     *
     * 동작
     * - 해당 작품과 연결된 촬영지(Spot) 목록을 조회
     *
     * 반환
     * - SpotResponse 리스트
     */
    @GetMapping("/artwork/{artworkId}/spots")
    public List<SpotResponse> getSpotsByArtwork(@PathVariable Long artworkId) {
        return artworkService.getSpotsByArtwork(artworkId);
    }

    /*
     * 4. 작품 타입 목록 조회
     *
     * GET /api/v1/main/artwork/types
     *
     * 동작
     * - DB에 저장된 작품 타입 목록 조회
     *
     * 예시
     * - 애니메이션
     * - 영화
     * - 드라마
     *
     * 반환
     * - ArtworkTypeResponse 리스트
     */
    @GetMapping("/artwork/types")
    public List<ArtworkTypeResponse> getArtworkTypes() {
        return artworkService.getArtworkTypes();
    }

    // 사용자가 입력한 작품명이 이미 내부 Artwork 테이블에 있는지 먼저 확인하는 API
    @GetMapping("/artwork/search")
    public List<ArtworkResponse> searchArtworks(@RequestParam String keyword) {
        return artworkService.searchArtworks(keyword);
    }

    /*
     * 5. 메인 화면 실시간 인기 게시글 조회
     *
     * GET /api/v1/main/trendingPost
     *
     * 동작
     * - 좋아요가 많은 게시글을 기준으로 인기글을 조회합니다.
     * - 현재는 루트가 있는 게시글만 대상으로 상위 10개를 반환합니다.
     *
     * 반환
     * - PostResponse 리스트
     */
    @GetMapping("/trendingPost")
    public List<PostResponse> getTrendingPosts() {
        return postService.getTopPosts();
    }
}