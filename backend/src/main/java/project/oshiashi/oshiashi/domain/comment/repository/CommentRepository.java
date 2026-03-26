package project.oshiashi.oshiashi.domain.comment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    @Query("""
    select c.post.postId, count(c)
    from CommentEntity c
    where c.post.postId in :postIds
    group by c.post.postId
""")
    List<Object[]> countByPostIds(List<Long> postIds);
}
