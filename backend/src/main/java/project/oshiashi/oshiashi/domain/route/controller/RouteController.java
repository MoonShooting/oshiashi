package project.oshiashi.oshiashi.domain.route.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.route.service.RouteService;

import java.time.LocalDateTime;
import java.util.List;

@RestController //@Controller와 @ResponseBody가 합쳐진 어노테이션입니다.
@RequestMapping("/api/routes")
@RequiredArgsConstructor //초기화되지 않은 final 필드(여기서는 routeService)에 대한 생성자를 자동으로 만들어줍니다.

public class RouteController {
	private final RouteService routeService;
	
	@GetMapping
	public List<RouteResponse> getRoutes() {
		return routeService.getAllRoutes();
	}
	
	@GetMapping("/{routeId}")
	public RouteResponse getRoute(@PathVariable Long routeId) {
		return routeService.getRouteById(routeId);
	}
	
	// 포스트맨 테스트용 더미 데이터
	
	/*
	@GetMapping("/test")
	public List<RouteResponse> test() {
		return List.of(
				RouteResponse.builder()
						.routeId(1L)
						.userId("user_nickname")
						.title("너의 이름은 도쿄 성지순례 코스")
						.isPublic(true)
						.createdAt(LocalDateTime.now())
						.build()
				
		);
	}
	
	 */
}
