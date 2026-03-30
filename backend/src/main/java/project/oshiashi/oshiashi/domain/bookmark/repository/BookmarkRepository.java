package project.oshiashi.oshiashi.domain.bookmark.repository;

import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.Optional;
import java.util.List;

@Repository
public interface BookmarkRepository extends JpaRepository<BookmarkEntity, Long> {
    
   // boolean existsByUser_UserIdAndPost_PostIdAndPostImage_PostImageIdAndRoute_RouteId(String userId, Long postId, Long postImageId, Long routeId);
    //너무 길면 @Query로 수정 가능합니다
   @Query("SELECT COUNT(b) > 0 FROM BookmarkEntity b " +
           "WHERE b.user.userId = :userId " +
           "AND b.post.postId = :postId " +
           "AND b.postImage.postImageId = :postImageId " +
           "AND b.route.routeId = :routeId")
   boolean existsCustom(@Param("userId") String userId,
                        @Param("postId") Long postId,
                        @Param("postImageId") Long postImageId,
                        @Param("routeId") Long routeId);
    /**
     * "SELECT COUNT(b) > 0 FROM BookmarkEntity b "
     * SELECT COUNT(b): BookmarkEntity의 개수를 세어보라는 뜻입니다.
     * COUNT(b) > 0: 개수가 0보다 크면 true, 0이면 false를 반환합니다.
     * 즉, 데이터가 존재하는지 여부를 논리값으로 바로 뽑아내는 부분입니다.
     
     * FROM BookmarkEntity b: BookmarkEntity를 조회하되, 별칭을 b로 부르겠다는 뜻입니다. (SQL의 AS와 비슷합니다.)
     * "WHERE b.user.userId = :userId "
     * b.user.userId: 북마크 엔티티(b) 안에 연결된 유저(user) 객체로 들어가서, 그 유저의 고유 ID인 userId 값을 확인하겠다는 경로입니다.
     * :userId: 메서드의 파라미터(@Param("userId"))로 전달된 실제 값을 이 자리에 채워 넣으라는 뜻입니다.
     */

	List<BookmarkEntity> findAllByUser(UserEntity user);

	// 프로필 요약에서 전체 엔티티 로딩 대신 COUNT 쿼리 사용
	long countByUser(UserEntity user);

	// 특정 유저가 소유한 특정 북마크 1건 조회
	// - 보안용: 남의 북마크 이름을 내 마음대로 바꾸는 공격을 방어하기 위함
	Optional<BookmarkEntity> findByBookmarkIdAndUser(Long bookmarkId, UserEntity user);
}
