package project.oshiashi.oshiashi.domain.bookmark.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;
import project.oshiashi.oshiashi.domain.bookmark.repository.BookmarkRepository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostImageRepository;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final RouteRepository routeRepository;

    @Override
    @Transactional
    public BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request) {
        validateRequest(request);

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 사용자입니다."));

        PostEntity post = null;
        PostImageEntity postImage = null;
        RouteEntity route = null;

        if (request.getPostId() != null) {
            if (bookmarkRepository.existsByUser_UserIdAndPost_PostId(userId, request.getPostId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 북마크한 게시글입니다.");
            }

            post = postRepository.findById(request.getPostId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.POST_NOT_FOUND));
        }

        if (request.getPostImageId() != null) {
            if (bookmarkRepository.existsByUser_UserIdAndPostImage_PostImageId(userId, request.getPostImageId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 북마크한 게시글 이미지입니다.");
            }

            postImage = postImageRepository.findById(request.getPostImageId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 게시글 이미지입니다."));
        }

        if (request.getRouteId() != null) {
            if (bookmarkRepository.existsByUser_UserIdAndRoute_RouteId(userId, request.getRouteId())) {
                throw new BusinessException(ErrorCode.DUPLICATE_RESOURCE, "이미 북마크한 루트입니다.");
            }

            route = routeRepository.findById(request.getRouteId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ROUTE_NOT_FOUND));
        }

        BookmarkEntity bookmark = BookmarkEntity.builder()
                .bookmarkName(request.getBookmarkName())
                .user(user)
                .post(post)
                .postImage(postImage)
                .route(route)
                .build();

        BookmarkEntity saved = bookmarkRepository.save(bookmark);
        return BookmarkResponse.fromEntity(saved);
    }

    @Override
    public List<BookmarkResponse> getBookmarksByUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "존재하지 않는 사용자입니다.");
        }

        return bookmarkRepository.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BookmarkResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void deleteBookmark(String userId, Long bookmarkId) {
        BookmarkEntity bookmark = bookmarkRepository.findByBookmarkIdAndUser_UserId(bookmarkId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "해당 사용자의 북마크가 존재하지 않습니다."));

        bookmarkRepository.delete(bookmark);
    }

    private void validateRequest(BookmarkCreateRequest request) {
        if (request.getBookmarkName() == null || request.getBookmarkName().isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "북마크 이름은 필수입니다.");
        }

        if (request.getBookmarkName().length() > 100) {
            throw new BusinessException(ErrorCode.INVALID_INPUT_VALUE, "북마크 이름은 100자 이하여야 합니다.");
        }

        int targetCount = 0;
        if (request.getPostId() != null) targetCount++;
        if (request.getPostImageId() != null) targetCount++;
        if (request.getRouteId() != null) targetCount++;

        if (targetCount != 1) {
            throw new BusinessException(ErrorCode.BOOKMARK_TARGET_INVALID);
        }
    }
}