package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, Long> {
	// 특정 유저가 쓴 글을 최신순으로 조회
	List<PostEntity> findAllByUserOrderByCreatedAtDesc(UserEntity user);


	// 특정 장소(spot)가 포함된 route를 참조하는 게시글 수
	@Query("""
        select count(distinct p)
        from PostEntity p
        join p.route r
        join r.routeSpots rs
        where rs.spot.spotId = :spotId
    """)
	Long countDistinctBySpotId(Long spotId);
	
	// route 필드가 null이 아닌 엔티티만 조회
	List<PostEntity> findAllByRouteIsNotNull();
	// 루트가 없는 게시글(커뮤니티)만 조회
	List<PostEntity> findAllByRouteIsNull();

	// 루트가 있는 게시글을 최신순으로 조회
	List<PostEntity> findAllByRouteIsNotNullOrderByCreatedAtDesc();

	// 루트가 있는 게시글을 조회수순으로 조회
	List<PostEntity> findAllByRouteIsNotNullOrderByViewCountDescCreatedAtDesc();

	// 루트가 있는 게시글을 좋아요순으로 조회
	List<PostEntity> findAllByRouteIsNotNullOrderByLikeCountDescCreatedAtDesc();

	// 루트가 없는 게시글을 최신순으로 조회
	List<PostEntity> findAllByRouteIsNullOrderByCreatedAtDesc();

	// 루트가 없는 게시글을 조회수순으로 조회
	List<PostEntity> findAllByRouteIsNullOrderByViewCountDescCreatedAtDesc();

	// 루트가 없는 게시글을 좋아요순으로 조회
	List<PostEntity> findAllByRouteIsNullOrderByLikeCountDescCreatedAtDesc();

	@Query("""
    select distinct p
    from PostEntity p
    join p.postTags pt
    join pt.tag t
    where p.route is not null
      and t.tagName in :tagNames
    order by p.createdAt desc
    """)
	List<PostEntity> findAllByRouteIsNotNullAndTagNamesInOrderByCreatedAtDesc(List<String> tagNames);

	@Query("""
    select distinct p
    from PostEntity p
    join p.postTags pt
    join pt.tag t
    where p.route is null
      and t.tagName in :tagNames
    order by p.createdAt desc
    """)
	List<PostEntity> findAllByRouteIsNullAndTagNamesInOrderByCreatedAtDesc(List<String> tagNames);

	// ─── 페이지네이션: Pageable 적용 쿼리 ───
	// (기존 전체 로드 메서드는 다른 곳에서 사용 중이므로 유지하고, Pageable 버전을 추가)

	List<PostEntity> findAllByRouteIsNotNullOrderByCreatedAtDesc(Pageable pageable);
	List<PostEntity> findAllByRouteIsNotNullOrderByViewCountDescCreatedAtDesc(Pageable pageable);
	List<PostEntity> findAllByRouteIsNotNullOrderByLikeCountDescCreatedAtDesc(Pageable pageable);

	List<PostEntity> findAllByRouteIsNullOrderByCreatedAtDesc(Pageable pageable);
	List<PostEntity> findAllByRouteIsNullOrderByViewCountDescCreatedAtDesc(Pageable pageable);
	List<PostEntity> findAllByRouteIsNullOrderByLikeCountDescCreatedAtDesc(Pageable pageable);

	@Query("""
	    select distinct p
	    from PostEntity p
	    join p.postTags pt
	    join pt.tag t
	    where p.route is not null
	      and t.tagName in :tagNames
	    order by p.createdAt desc
	    """)
	List<PostEntity> findAllByRouteIsNotNullAndTagNamesInOrderByCreatedAtDesc(
			@Param("tagNames") List<String> tagNames, Pageable pageable);

	@Query("""
	    select distinct p
	    from PostEntity p
	    join p.postTags pt
	    join pt.tag t
	    where p.route is null
	      and t.tagName in :tagNames
	    order by p.createdAt desc
	    """)
	List<PostEntity> findAllByRouteIsNullAndTagNamesInOrderByCreatedAtDesc(
			@Param("tagNames") List<String> tagNames, Pageable pageable);

	// ─── 성능 최적화: DB 레벨 검색 (LIKE) 쿼리 ───
	// 기존: 전체 로드 후 Java stream().filter()로 검색 → 전체 데이터를 메모리에 올림
	// 개선: DB에서 LIKE 조건으로 필터링 후 페이지네이션 적용
	// (content가 @Lob TEXT이므로 네이티브 쿼리 사용)

	@Query(value = "SELECT * FROM post p WHERE p.route_id IS NOT NULL AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.created_at DESC",
			nativeQuery = true)
	List<PostEntity> searchByRouteNotNullLatest(@Param("search") String search, Pageable pageable);

	@Query(value = "SELECT * FROM post p WHERE p.route_id IS NOT NULL AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.view_count DESC, p.created_at DESC",
			nativeQuery = true)
	List<PostEntity> searchByRouteNotNullViews(@Param("search") String search, Pageable pageable);

	@Query(value = "SELECT * FROM post p WHERE p.route_id IS NOT NULL AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.like_count DESC, p.created_at DESC",
			nativeQuery = true)
	List<PostEntity> searchByRouteNotNullPopular(@Param("search") String search, Pageable pageable);

	@Query(value = "SELECT * FROM post p WHERE p.route_id IS NULL AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.created_at DESC",
			nativeQuery = true)
	List<PostEntity> searchByRouteNullLatest(@Param("search") String search, Pageable pageable);

	@Query(value = "SELECT * FROM post p WHERE p.route_id IS NULL AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.view_count DESC, p.created_at DESC",
			nativeQuery = true)
	List<PostEntity> searchByRouteNullViews(@Param("search") String search, Pageable pageable);

	@Query(value = "SELECT * FROM post p WHERE p.route_id IS NULL AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.content) LIKE LOWER(CONCAT('%', :search, '%'))) ORDER BY p.like_count DESC, p.created_at DESC",
			nativeQuery = true)
	List<PostEntity> searchByRouteNullPopular(@Param("search") String search, Pageable pageable);

	// ─── 성능 최적화: JOIN FETCH 쿼리 ───

	/**
	 * 게시글 단건 상세 조회 — 엔티티 그래프 전체를 1~2 쿼리로 로드
	 * (N+1 문제 해결: 기존 findById → 22 쿼리 → 2 쿼리)
	 */
	@Query("""
		SELECT DISTINCT p FROM PostEntity p
		LEFT JOIN FETCH p.user
		LEFT JOIN FETCH p.route r
		LEFT JOIN FETCH r.routeSpots rs
		LEFT JOIN FETCH rs.spot s
		LEFT JOIN FETCH s.artwork a
		WHERE p.postId = :postId
	""")
	Optional<PostEntity> findByIdWithRouteGraph(@Param("postId") Long postId);

	/**
	 * 게시글 단건 — 이미지를 로드
	 * (MultipleBagFetchException 방지를 위해 images와 postTags를 별도 쿼리로 분리)
	 */
	@Query("""
		SELECT DISTINCT p FROM PostEntity p
		LEFT JOIN FETCH p.images
		WHERE p.postId = :postId
	""")
	Optional<PostEntity> findByIdWithImages(@Param("postId") Long postId);

	/**
	 * 게시글 단건 — 태그를 로드
	 */
	@Query("""
		SELECT DISTINCT p FROM PostEntity p
		LEFT JOIN FETCH p.postTags pt
		LEFT JOIN FETCH pt.tag
		WHERE p.postId = :postId
	""")
	Optional<PostEntity> findByIdWithTags(@Param("postId") Long postId);

	/**
	 * 인기 게시글 Top N — DB 레벨에서 LIMIT 적용
	 * (기존: 전체 로드 후 Java .limit(10) → 221 쿼리 → 1 쿼리)
	 */
	@Query("""
		SELECT p FROM PostEntity p
		LEFT JOIN FETCH p.user
		WHERE p.route IS NOT NULL
		ORDER BY p.likeCount DESC, p.createdAt DESC
	""")
	List<PostEntity> findTopPostsWithUser(Pageable pageable);

}
