package project.oshiashi.oshiashi.domain.spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpotRepository extends JpaRepository<SpotEntity, Long> {
	// 특정 작품에 해당하는 모든 성지(Spot) 조회
	List<SpotEntity> findByArtwork_ArtworkId(Long artworkId);

	// 장소 이름 + 작품 제목 기준 키워드 검색
	@Query("""
        select s
        from SpotEntity s
        join fetch s.artwork a
        join fetch a.artworkType t
        where lower(s.name) like lower(concat('%', :keyword, '%'))
           or lower(a.title) like lower(concat('%', :keyword, '%'))
    """)
	List<SpotEntity> searchByKeyword(String keyword);

	// 현재 지도 범위 안에 포함되는 장소만 조회
	@Query("""
        select s
        from SpotEntity s
        join fetch s.artwork a
        join fetch a.artworkType t
        where s.latitude between :south and :north
          and s.longitude between :west and :east
    """)
	List<SpotEntity> findMarkersInBounds(Double north, Double south, Double east, Double west);

	// 장소 상세 조회용: Spot + Artwork + ArtworkType까지 한 번에 가져오기
	@Query("""
        select s
        from SpotEntity s
        join fetch s.artwork a
        join fetch a.artworkType t
        where s.spotId = :placeId
    """)
	Optional<SpotEntity> findDetailByPlaceId(Long placeId);
}
