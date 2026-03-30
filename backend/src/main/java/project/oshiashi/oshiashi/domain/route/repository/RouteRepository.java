package project.oshiashi.oshiashi.domain.route.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, Long> {
	// 특정 사용자가 만든 루트 목록 조회
    List<RouteEntity> findByUser_UserIdOrderByCreatedAtDesc(String userId);
    Optional<RouteEntity> findByRouteIdAndUser_UserId(Long routeId, String userId);

	// UserService의  내 루트 조회 RouteRepository.findAllByUser(me) 호출을 처리하기 위함
	List<RouteEntity> findAllByUser(UserEntity user);

	// ── 성능 최적화: Route → RouteSpot → Spot → Artwork 전체를 1 쿼리로 로드 ──
	// 기존: findByUser_UserId → Route N개 × RouteSpot LAZY × Spot LAZY × Artwork LAZY = 113+ 쿼리
	// 개선: JOIN FETCH 체인으로 1 쿼리에 전부 로드
	@Query("""
		SELECT DISTINCT r FROM RouteEntity r
		LEFT JOIN FETCH r.routeSpots rs
		LEFT JOIN FETCH rs.spot s
		LEFT JOIN FETCH s.artwork a
		WHERE r.user.userId = :userId
		ORDER BY r.createdAt DESC
	""")
	List<RouteEntity> findByUserIdWithFullGraph(@Param("userId") String userId);

	// 루트 단건 상세 조회 — 전체 그래프 로드
	@Query("""
		SELECT DISTINCT r FROM RouteEntity r
		LEFT JOIN FETCH r.routeSpots rs
		LEFT JOIN FETCH rs.spot s
		LEFT JOIN FETCH s.artwork a
		WHERE r.routeId = :routeId
		AND r.user.userId = :userId
	""")
	Optional<RouteEntity> findByIdAndUserIdWithFullGraph(
			@Param("routeId") Long routeId,
			@Param("userId") String userId
	);
}
