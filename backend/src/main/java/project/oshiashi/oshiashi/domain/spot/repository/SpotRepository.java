package project.oshiashi.oshiashi.domain.spot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.spot.entity.SpotEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpotRepository extends JpaRepository<SpotEntity, Long> {
	// 특정 작품에 해당하는 모든 성지(Spot) 조회 (기본 - 호환용)
	List<SpotEntity> findByArtwork_ArtworkId(Long artworkId);

	// ── 성능 최적화: Artwork + ArtworkType JOIN FETCH ──
	// 기존: findByArtwork_ArtworkId → MapPlaceResponse.from()에서 Artwork LAZY 로드 = N+1
	// 개선: 1 쿼리로 Artwork + ArtworkType까지 로드
	@Query("""
	    SELECT s FROM SpotEntity s
	    JOIN FETCH s.artwork a
	    JOIN FETCH a.artworkType
	    WHERE a.artworkId = :artworkId
	""")
	List<SpotEntity> findByArtworkIdWithType(@Param("artworkId") Long artworkId);

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

	// 장소 이름 기준 자동완성 추천어 조회
	@Query("""
    select distinct s.name
    from SpotEntity s
    where lower(s.name) like lower(concat('%', :keyword, '%'))
    order by s.name asc
    """)
	List<String> findTop5SpotNamesByKeyword(String keyword);

	// 장소명 + 작품명 검색 결과 중에서 작품 타입(mediaType)까지 일치하는 장소만 조회
	@Query("""
    select s
    from SpotEntity s
    join fetch s.artwork a
    join fetch a.artworkType t
    where (
        lower(s.name) like lower(concat('%', :keyword, '%'))
        or lower(a.title) like lower(concat('%', :keyword, '%'))
    )
    and lower(t.artworkTypeName) = lower(:mediaType)
    """)
	List<SpotEntity> searchByKeywordAndMediaType(String keyword, String mediaType);

	// ── 성능 최적화: 전체 장소 조회 시 Artwork + ArtworkType JOIN FETCH ──
	// (기존: findAll() → Spot N개 × Artwork LAZY × ArtworkType LAZY = 34+ 쿼리)
	// (개선: 1 쿼리로 전부 로드)
	@Query("""
		SELECT s FROM SpotEntity s
		JOIN FETCH s.artwork a
		JOIN FETCH a.artworkType
	""")
	List<SpotEntity> findAllWithArtwork();

}
