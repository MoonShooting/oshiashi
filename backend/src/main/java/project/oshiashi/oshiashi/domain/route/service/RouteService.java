package project.oshiashi.oshiashi.domain.route.service;

import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;

import java.util.List;

public interface RouteService {
	List<RouteResponse> getAllRoutes();
	RouteResponse getRouteById(Long routeId);
}
/*
  인터페이스를 이용함으로써 사용법(Interface)과 실제 기능(Impl) 을 분리
  1. 규격 정의: 서비스가 제공해야 할 기능을 명세하여, 내부 구현이 어떻게 바뀌든 외부(Controller 등)와의 약속을 유지
  2. 가독성 향상: 핵심 기능만 나열되어 있어 서비스의 전체적인 역할을 한눈에 파악하기 좋습니다.
  3. 보안성? : 실제 비즈니스 로직(How)을 Impl 뒤로 숨겨 인터페이스(What)만 노출함으로써 설계를 깔끔하게 유지합니다.
 */
