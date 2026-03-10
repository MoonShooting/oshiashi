package project.oshiashi.oshiashi.domain.bookmark.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;

import java.util.Optional;
import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {
    // 조회는 보통 "유저 북마크 최신순"이 필요해서 정렬까지 넣어두는 것을 추천하여 추가
    List<BookmarkEntity> findByUser_UserIdOrderByCreatedAtDesc(String userId);

    // 북마크 삭제/수정 시 본인 북마크인지 검증하기 위해 bookmarkId + userId로 조회
    Optional<BookmarkEntity> findByBookmarkIdAndUser_UserId(Long bookmarkId, String userId);

    // 특정 유저가 해당 게시글(post)을 이미 북마크했는지 여부 확인 (중복 북마크 방지)
    boolean existsByUser_UserIdAndPost_PostId(String userId, Long postId);

    // 특정 유저가 해당 게시글 이미지(postImage)를 이미 북마크했는지 여부 확인 (중복 북마크 방지)
    boolean existsByUser_UserIdAndPostImage_PostImageId(String userId, Long postImageId);

    // 특정 유저가 해당 루트(route)를 이미 북마크했는지 여부 확인 (중복 북마크 방지)
    boolean existsByUser_UserIdAndRoute_RouteId(String userId, Long routeId);
}
