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
    
    /**
     * [북마크 여부 확인]
     * * 1. findBy : 조회하겠다 (SELECT)
     * 2. Post_PostId : Bookmark 엔티티 내 PostEntity 객체의 'postId' 필드값 비교
     * 3. And : 그리고 (WHERE 조건 연결)
     * 4. User_UserId : Bookmark 엔티티 내 UserEntity 객체의 'userId' 필드값 비교
     * * 결과: 특정 유저가 특정 게시글을 북마크했는지 데이터(Optional)를 찾아옴
     */
	Optional<BookmarkEntity> findByPost_PostIdAndUser_UserId(Long postId, String userId);
    
    //bookmarkRepository.findByUser_UserId는 DB의 북마크 테이블에서 현재 내 아이디(userId)로 저장된 데이터만 전부 긁어옵니다.
    //북마크를 누름(ON): DB에 데이터가 저장됨 → 리스트에 포함됨
    //북마크를 안 누름 or 취소함(OFF): DB에 데이터가 없음 → 리스트에 안 나옴
    List<BookmarkEntity> findByUser_UserId(String userId);
}
