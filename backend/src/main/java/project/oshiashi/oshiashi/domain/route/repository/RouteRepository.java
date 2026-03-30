package project.oshiashi.oshiashi.domain.route.repository;

import org.springframework.data.jpa.repository.JpaRepository;
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
	// 제목으로 루트 검색

	// UserService의  내 루트 조회 RouteRepository.findAllByUser(me) 호출을 처리하기 위함
	List<RouteEntity> findAllByUser(UserEntity user);

	// 프로필 요약에서 전체 엔티티 로딩 대신 COUNT 쿼리 사용
	long countByUser(UserEntity user);
}
