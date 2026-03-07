package project.oshiashi.oshiashi.domain.spot.service;

import project.oshiashi.oshiashi.domain.spot.dto.SpotResponse;

import java.util.List;

public interface SpotService {
	// 모든 성지 목록 조회
	List<SpotResponse> getAllSpots();
	// 특정 성지 상세 조회
	SpotResponse getSpotById(Long spotId);
}

/*
  인터페이스를 이용함으로써 사용법(Interface)과 실제 기능(Impl)을 분리
  1. 규격 정의: 서비스가 제공해야 할 기능을 명세하여, 내부 구현이 어떻게 바뀌든 외부(Controller 등)와의 약속을 유지
  2. 가독성 향상: 핵심 기능만 나열되어 있어 서비스의 전체적인 역할을 한눈에 파악하기 좋습니다.
 */
