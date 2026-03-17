package project.oshiashi.oshiashi.domain.route.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, Long> {
	// 특정 사용자가 만든 루트 목록 조회
    List<RouteEntity> findByUser_UserIdOrderByCreatedAtDesc(String userId);
    Optional<RouteEntity> findByRouteIdAndUser_UserId(Long routeId, String userId);
	// 제목으로 루트 검색
}
