package project.oshiashi.oshiashi.domain.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<PostEntity, Long> {
	// 특정 유저가 쓴 글을 최신순으로 조회
	List<PostEntity> findAllByUserOrderByCreatedAtDesc(UserEntity user);

	// 게시글 전체를 최신순으로 조회
	List<PostEntity> findAllByOrderByCreatedAtDesc();

	// 게시글 전체를 조회수순으로 조회 (조회수가 같으면 최신 글 우선)
	List<PostEntity> findAllByOrderByViewCountDescCreatedAtDesc();

	// 게시글 전체를 좋아요순으로 조회 (좋아요 수가 같으면 최신 글 우선)
	List<PostEntity> findAllByOrderByLikeCountDescCreatedAtDesc();

	// 특정 장소(spot)가 포함된 route를 참조하는 게시글 수
	@Query("""
        select count(distinct p)
        from PostEntity p
        join p.route r
        join r.routeSpots rs
        where rs.spot.spotId = :spotId
    """)
	Long countDistinctBySpotId(Long spotId);
}
