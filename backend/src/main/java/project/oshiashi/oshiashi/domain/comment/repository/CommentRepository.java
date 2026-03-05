package project.oshiashi.oshiashi.domain.comment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    // 목록 조회를 위해 리스트로 받아오겠습니다
    List<CommentEntity> findByPost_PostIdOrderByCreatedAtAsc(Long postId);
}
