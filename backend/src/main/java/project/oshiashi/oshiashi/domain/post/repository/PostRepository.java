package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, Long> {
	// 특정 유저가 쓴 글을 최신순으로 조회 (user, route를 함께 페치하여 N+1 방지)
	@EntityGraph(attributePaths = {"user", "route"})
	List<PostEntity> findAllByUserOrderByCreatedAtDesc(UserEntity user);


	// 프로필 요약에서 전체 엔티티 로딩 대신 COUNT 쿼리 사용
	long countByUser(UserEntity user);

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

	// 인기 게시글 상위 10개를 DB 레벨에서 LIMIT하고, user/route를 JOIN FETCH하여 N+1 방지
	@Query("""
		SELECT p FROM PostEntity p
		JOIN FETCH p.user
		LEFT JOIN FETCH p.route
		WHERE p.route IS NOT NULL
		ORDER BY p.likeCount DESC, p.createdAt DESC
		LIMIT 10
		""")
	List<PostEntity> findTop10WithRouteOrderByLikeCountDesc();

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

}
