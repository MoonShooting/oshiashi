package project.oshiashi.oshiashi.domain.spot.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpotServiceImpl implements SpotService{
	
	private final SpotRepository spotRepository;
	
	@Override
	public List<SpotResponse> getAllSpots() {
		return spotRepository.findAll().stream()
				.map(SpotResponse::fromEntity)   // 엔티티를 DTO로 변환
				.collect(Collectors.toList());   // 변환된 것들을 다시 List에 수집
	}
	
	// 단건 조회
	@Override
	public SpotResponse getSpotById(Long spotId) {
		return spotRepository.findById(spotId)
				.map(SpotResponse::fromEntity)
				.orElseThrow(() -> new RuntimeException("해당 장소를 찾을 수 없습니다."));
	}
}
