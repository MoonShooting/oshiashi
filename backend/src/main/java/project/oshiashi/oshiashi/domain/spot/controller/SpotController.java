package project.oshiashi.oshiashi.domain.spot.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.spot.dto.SpotCreateRequest;
import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;
import project.oshiashi.oshiashi.domain.spot.service.SpotService;

@RestController //@RestController: @Controller + @ResponseBody가 결합된 어노테이션입니다.
@RequestMapping("/api/v1/spots")
@RequiredArgsConstructor
public class SpotController {
	
	private final SpotService spotService;
	
	/**
	 * [POST] 신규 스팟 등록
	 * @RequestBody: 클라이언트가 보낸 JSON 데이터를 SpotCreateRequest 객체로 변환합니다.
	 * ResponseEntity: 응답 상태 코드(201 Created)와 데이터를 함께 반환하기 위해 사용합니다.
	 */
	@PostMapping
	public ResponseEntity<SpotResponse> createSpot(@RequestBody SpotCreateRequest request) {
		// 서비스의 등록 로직을 호출합니다.
		SpotResponse response = spotService.createSpot(request);
		
		// 생성 성공 시 201(Created) 상태 코드를 반환하는 것
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}
	
	/**
	 * [PUT] 기존 스팟 정보 수정
	 * @PathVariable: URL 경로에 포함된 {spotId} 값을 파라미터로 가져옵니다.
	 * 수정 시에도 기존에 만든 SpotCreateRequest를 재사용합니다.
	 */
	@PatchMapping("/{spotId}")
	public ResponseEntity<SpotResponse> updateSpot(
			@PathVariable Long spotId,
			@RequestBody SpotCreateRequest request) {
		
		// 서비스의 수정 로직을 호출합니다. (서비스에서 Route 시간 갱신 )
		SpotResponse response = spotService.updateSpot(spotId, request);
		
		// 수정 성공 시 200(OK) 상태 코드를 반환합니다.
		return ResponseEntity.ok(response);
	}
}
