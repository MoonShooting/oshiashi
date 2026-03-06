package project.oshiashi.oshiashi.domain.bookmark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;

import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {
    // 조회는 보통 "유저 북마크 최신순"이 필요해서 정렬까지 넣어두는 것을 추천하여 추가
    List<BookmarkEntity> findByUser_UserIdOrderByCreatedAtDesc(String userId);
}
