package project.oshiashi.oshiashi.domain.spot.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.repository.ArtworkRepository;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.spot.dto.SpotCreateRequest;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor // final이 붙은 필드들을 인자로 받는 생성자 사용. (생성자 주입 방식)
public class SpotService {
	private final SpotRepository spotRepository;
	private final ArtworkRepository artworkRepository;
	private final RouteRepository routeRepository; // 트리거 2번(Route 갱신)을 위해 필요
	
	/**
	 * 신규 SPOT 등록 (명세서 트리거 1번 반영)
	 */
	@Transactional //이 메서드 내부의 모든 DB 작업은 하나의 작업 단위(트랜잭션)로 묶입니다.* 작업 중 예외 발생 시 이전까지의 모든 변경 사항을 원복(Rollback)합니다.
	public SpotResponse createSpot(SpotCreateRequest request) {
		// 1. 위도/경도 유효범위 및 필수값 체크 (트리거 1)
		validateSpotLocation(request.getLatitude(), request.getLongitude(), request.getAddress());
		
		// 연관된 작품이 실제로 존재하는지 확인
		ArtworkEntity artwork = artworkRepository.findById(request.getArtworkId())
				.orElseThrow(() -> new EntityNotFoundException("작품을 찾을 수 없습니다."));
		
		SpotEntity spot = request.toEntity(artwork);
		SpotEntity savedSpot = spotRepository.save(spot);
		
		// 저장된 결과를 다시 DTO(Response)로 변환하여 반환
		return SpotResponse.fromEntity(savedSpot);
	}
	
	/**
	 * SPOT 정보 수정 (명세서 트리거 2번 반영)
	 */
	@Transactional
	public SpotResponse updateSpot(Long spotId, SpotCreateRequest request) {
		SpotEntity spot = spotRepository.findById(spotId)
				.orElseThrow(() -> new EntityNotFoundException("해당 스팟을 찾을 수 없습니다."));
		
		// 1. 위도/경도 유효범위 체크 (수정 시에도 동일 적용)
		validateSpotLocation(request.getLatitude(), request.getLongitude(), request.getAddress());
		
		// 2. 엔티티 데이터 업데이트 (수정)
		spot.update(
				request.getName(),
				request.getLatitude(),
				request.getLongitude(),
				request.getAddress(),
				request.getSceneImgUrl()
		);
		
		// 3. 트리거 2: 해당 장소를 포함 및
		// TODO : 모든 Route의 최종 업데이트 시간 갱신 route에 업데이트 시간 컬럼 논의 필요
		//routeRepository.updateRouteTimestampBySpotId(spotId);
		
		return SpotResponse.fromEntity(spot);
	}
	
	/**
	 * 명세서 트리거 1번: 위경도 유효범위 및 누락 체크 로직
	 */
	private void validateSpotLocation(BigDecimal lat, BigDecimal lng, String address) {
		// 1. 주소와 좌표가 모두 없는지부터 체크 (명세서 트리거 조건)
		if ((lat == null || lng == null) && (address == null || address.isBlank())) {
			throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "주소와 좌표 정보가 모두 누락되었습니다.");
		}
		
		// 2. 좌표가 있다면, 그 좌표가 유효한 범위인지 체크
		if (lat != null && lng != null) {
			boolean isLatValid = lat.compareTo(new BigDecimal("-90")) >= 0 && lat.compareTo(new BigDecimal("90")) <= 0;
			boolean isLngValid = lng.compareTo(new BigDecimal("-180")) >= 0 && lng.compareTo(new BigDecimal("180")) <= 0;
			
			if (!isLatValid || !isLngValid) {
				throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "위도 또는 경도가 유효 범위를 벗어났습니다.");
			}
		}
	}
}