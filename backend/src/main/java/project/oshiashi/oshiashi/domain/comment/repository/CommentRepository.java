package project.oshiashi.oshiashi.domain.comment.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.Collection;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    // 목록 조회를 위해 리스트로 받아오겠습니다
    List<CommentEntity> findByPost_PostIdOrderByCreatedAtAsc(Long postId);
	List<CommentEntity> findAllByUserOrderByCreatedAtDesc(UserEntity user);

	List<CommentEntity> findByParent_CommentIdOrderByCreatedAtAsc(Long parentId);

	// ── 성능 최적화: User + Parent를 JOIN FETCH로 한 번에 로드 ──
	// (기존: 댓글 N개 × User LAZY 로드 = ~15 쿼리 → 1 쿼리)
	@Query("""
		SELECT c FROM CommentEntity c
		LEFT JOIN FETCH c.user
		LEFT JOIN FETCH c.parent
		WHERE c.post.postId = :postId
		ORDER BY c.createdAt ASC
	""")
	List<CommentEntity> findByPostIdWithUser(@Param("postId") Long postId);

	// 대댓글 조회도 User JOIN FETCH 적용
	@Query("""
		SELECT c FROM CommentEntity c
		LEFT JOIN FETCH c.user
		WHERE c.parent.commentId = :parentId
		ORDER BY c.createdAt ASC
	""")
	List<CommentEntity> findRepliesWithUser(@Param("parentId") Long parentId);

	// ── 페이지네이션: 댓글 목록 Pageable 적용 ──
	@Query("""
		SELECT c FROM CommentEntity c
		LEFT JOIN FETCH c.user
		LEFT JOIN FETCH c.parent
		WHERE c.post.postId = :postId
		ORDER BY c.createdAt ASC
	""")
	List<CommentEntity> findByPostIdWithUser(@Param("postId") Long postId, Pageable pageable);

    @Query("""
    select c.post.postId, count(c)
    from CommentEntity c
    where c.post.postId in :postIds
    group by c.post.postId
""")
    List<Object[]> countByPostIds(List<Long> postIds);
}
