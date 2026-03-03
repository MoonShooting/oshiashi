package project.oshiashi.oshiashi.domain.route.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteSpotId;

import java.util.List;

@Repository
public interface RouteSpotRepository extends JpaRepository<RouteSpotEntity, RouteSpotId> {
	
	// 특정 루트에 포함된 모든 장소(Spot)들을 순서대로 조회
	// 리스트로 가져와서 화면에 코스를 그릴 때 사용한다고합니다
	//List<RouteSpotEntity> findByRoute_RouteIdOrderBySequenceAsc(Long routeId);
	

}
