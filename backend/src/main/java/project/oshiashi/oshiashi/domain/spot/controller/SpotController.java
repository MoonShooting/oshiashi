package project.oshiashi.oshiashi.domain.spot.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;
import project.oshiashi.oshiashi.domain.spot.service.SpotService;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/spots")
@RequiredArgsConstructor
public class SpotController {
	private final SpotService spotService;
	
	// 전체 조회
	@GetMapping
	public List<SpotResponse> getSpots() {
		return spotService.getAllSpots();
	}
	
	// 단건 조회
	@GetMapping("/{spotId}")
	public SpotResponse getSpot(@PathVariable Long spotId) {
		return spotService.getSpotById(spotId);
	}
	
	/*
	// 포스트맨 테스트용 더미 데이터 API
	@GetMapping("/test")
	public List<SpotResponse> test() {
		return List.of(
				SpotResponse.builder()
						.spotId(2L)
						.artworkId(101L)
						.name("주인공이 살던 아파트")
						.latitude(new BigDecimal("35.6894875"))
						.longitude(new BigDecimal("139.6917064"))
						.address("일본 도쿄도 신주쿠구")
						.sceneImgUrl("https://example.com/spot2.jpg")
						.build()
		);
	}
	
	 */
}
