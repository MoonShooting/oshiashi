package project.oshiashi.oshiashi.domain.bookmark.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;
import project.oshiashi.oshiashi.domain.bookmark.repository.BookmarkRepository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request) {
        validateExactlyOneTarget(request);

        UserEntity userRef = entityManager.getReference(UserEntity.class, userId);

        PostEntity postRef = null;
        PostImageEntity postImageRef = null;
        RouteEntity routeRef = null;

        if (request.getPostId() != null) {
            postRef = entityManager.getReference(PostEntity.class, request.getPostId());
        } else if (request.getPostImageId() != null) {
            postImageRef = entityManager.getReference(PostImageEntity.class, request.getPostImageId());
        } else {
            routeRef = entityManager.getReference(RouteEntity.class, request.getRouteId());
        }

        BookmarkEntity bookmark = BookmarkEntity.builder()
                .bookmarkName(request.getBookmarkName())
                .user(userRef)
                .post(postRef)
                .postImage(postImageRef)
                .route(routeRef)
                // createdAt은 @PrePersist에서 자동 세팅됨
                .build();

        BookmarkEntity saved = bookmarkRepository.save(bookmark);
        return BookmarkResponse.fromEntity(saved);
    }

    @Override
    public List<BookmarkResponse> getBookmarksByUser(String userId) {
        return bookmarkRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BookmarkResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void deleteBookmark(Long bookmarkId) {
        bookmarkRepository.deleteById(bookmarkId);
    }

    private void validateExactlyOneTarget(BookmarkCreateRequest request) {
        int count = 0;
        if (request.getPostId() != null) count++;
        if (request.getPostImageId() != null) count++;
        if (request.getRouteId() != null) count++;

        if (count != 1) {
            throw new IllegalArgumentException("postId, postImageId, routeId 중 정확히 1개만 입력해야 합니다.");
        }
    }
}