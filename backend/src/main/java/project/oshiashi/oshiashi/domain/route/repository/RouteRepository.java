package project.oshiashi.oshiashi.domain.route.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;

@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, Long> {
	// 특정 사용자가 만든 루트 목록 조회
	
	// 제목으로 루트 검색
}
