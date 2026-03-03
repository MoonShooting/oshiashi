package project.oshiashi.oshiashi.domain.spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

@Repository
public interface SpotRepository extends JpaRepository<SpotEntity, Long> {
	// 특정 작품에 해당하는 모든 성지(Spot) 조회
	//List<SpotEntity> findByArtwork_ArtworkId(Long artworkId);
	
}
