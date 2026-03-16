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

/*
 * Artwork 조회 관련 비즈니스 로직을 담당하는 서비스 구현 클래스
 *
 * 역할
 * - 작품 목록 조회
 * - 작품 상세 조회
 * - 작품 타입 조회
 * - 작품별 촬영지 조회
 *
 * Controller는 요청/응답만 처리하고
 * 실제 데이터 조회 및 변환 로직은 Service에서 담당합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ArtworkServiceImpl implements ArtworkService {

    /*
     * 작품 데이터 조회용 Repository
     */
    private final ArtworkRepository artworkRepository;

    /*
     * 작품 타입 조회용 Repository
     */
    private final ArtworkTypeRepository artworkTypeRepository;

    /*
     * 촬영지(Spot) 조회용 Repository
     */
    private final SpotRepository spotRepository;


    /*
     * 전체 작품 목록 조회
     *
     * DB에서 ArtworkEntity 리스트를 가져온 뒤
     * API 응답용 DTO(ArtworkResponse)로 변환합니다.
     */
    @Override
    public List<ArtworkResponse> getArtworks() {
        return artworkRepository.findAll().stream()
                /*
                 * Entity → DTO 변환
                 *
                 * Entity를 그대로 반환하지 않고
                 * API 응답 전용 DTO로 변환합니다.
                 */
                .map(ArtworkResponse::fromEntity)
                /*
                 * Stream 결과를 List로 변환
                 */
                .toList();
    }

    /*
     * 작품 단건 조회
     */
    @Override
    public ArtworkResponse getArtwork(Long artworkId) {
        /*
         * 해당 ID의 작품을 조회
         * 존재하지 않으면 예외 발생
         */
        ArtworkEntity artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new IllegalArgumentException("Artwork not found"));

        // Entity → DTO 변환
        return ArtworkResponse.fromEntity(artwork);
    }

    /*
     * 작품 타입별 작품 조회
     *
     * 예
     * - 영화만 조회
     * - 드라마만 조회
     * - 애니메이션만 조회
     */
    @Override
    public List<ArtworkResponse> getArtworksByType(Long artworkTypeId) {
        /*
         * artworkType 객체 내부의 artworkTypeId 기준으로 조회
         *
         * JPA 메서드 네이밍 규칙
         * 객체명_필드명 형태로 작성하면
         * 자동으로 join 조건을 생성합니다.
         */
        return artworkRepository.findByArtworkType_ArtworkTypeId(artworkTypeId).stream()
                .map(ArtworkResponse::fromEntity)
                .toList();
    }

    /*
     * 작품 타입 목록 조회
     *
     * 예
     * - 영화
     * - 드라마
     * - 애니메이션
     */
    @Override
    public List<ArtworkTypeResponse> getArtworkTypes() {
        return artworkTypeRepository.findAll().stream()
                /*
                 * Entity → DTO 변환
                 */
                .map(ArtworkTypeResponse::from)
                .toList();
    }

    /*
     * 특정 작품의 촬영지 목록 조회
     *
     * 예
     * "너의 이름은" 작품 → 실제 촬영지 리스트
     */
    @Override
    public List<SpotResponse> getSpotsByArtwork(Long artworkId) {
        /*
         * SpotEntity에서 artwork_id 기준으로 조회
         */
        return spotRepository.findByArtwork_ArtworkId(artworkId).stream()
                .map(SpotResponse::fromEntity)
                .toList();
    }
}