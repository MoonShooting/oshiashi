package project.oshiashi.oshiashi.domain.route.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.spot.repository.SpotRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteServiceImpl implements RouteService{
	private final RouteRepository routeRepository;
	
	@Override
	public List<RouteResponse> getAllRoutes() {
		return routeRepository.findAll().stream()
				.map(RouteResponse::fromEntity)  // 엔티티를 DTO로 변환
				.collect(Collectors.toList());   // 변환된 것들을 다시 List에 수집
	}
	
	// 단건 조회
	@Override
	public RouteResponse getRouteById(Long routeId) {
		return routeRepository.findById(routeId)
				.map(RouteResponse::fromEntity)
				.orElseThrow(() -> new RuntimeException("해당 경로를 찾을 수 없습니다."));
	}
}
