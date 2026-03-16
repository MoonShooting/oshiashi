package project.oshiashi.oshiashi.domain.bookmark.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;
import project.oshiashi.oshiashi.domain.bookmark.repository.BookmarkRepository;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
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
import project.oshiashi.oshiashi.security.AuthenticatedUser;

import java.util.List;
import java.util.Optional;

@Slf4j
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
    
    
    
    @Override
    public boolean toggleBookmark(Long postId) {
        UserEntity user = getCurrentUserEntity(); // 기존에 인증 메서드 활용
        
        // 1. 이미 북마크했는지 확인
        Optional<BookmarkEntity> existing = bookmarkRepository.findByPost_PostIdAndUser_UserId(postId, user.getUserId());
        
        if (existing.isPresent()) {
            // 2. 존재하면 삭제 (OFF)
            bookmarkRepository.delete(existing.get());
            log.debug("북마크 해제(OFF) - 유저: {}, 게시글: {}", user.getUserId(), postId);
            return false;
        } else {
            // 3. 존재하지 않으면 생성 (ON)
            PostEntity post = postRepository.findById(postId)
                    .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));
            
            BookmarkEntity bookmark = BookmarkEntity.builder()
                    .post(post)
                    .user(user)
                    .build();
            
            bookmarkRepository.save(bookmark);
            log.debug("북마크 등록(ON) - 유저: {}, 게시글: {}", user.getUserId(), postId);
            return true;
        }
    }
    
    @Override
    public List<PostResponse> getMyBookmarks() {
        UserEntity user = getCurrentUserEntity();
        
        // 내 북마크 엔티티들을 가져옴
        List<BookmarkEntity> bookmarks = bookmarkRepository.findByUser_UserId(user.getUserId());
        
        // 북마크된 '게시글' 정보만 추출해서 Response DTO로 변환
        return bookmarks.stream()// 위(리포지토리)에서 뽑힌 'ON' 만 골라서
                .map(bookmark -> PostResponse.fromEntity(bookmark.getPost()))
                .toList();
    }
    
    //TODO : 서큐리티 보안단 post 랑 연동해서 보안 통과한 사람만 실행가능
    private UserEntity getCurrentUserEntity() {
        // TODO : 실제 사용자 정보 확인
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.debug("현재 로그인 상태 검사 : {}", principal);
        
        // 인증 안 된 상태면 principal이 String("anonymousUser")일 수 있음
        if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        log.debug("통과 여부 체크 : {}", principal);
        return authenticatedUser.user();
    }
    // TODO: 보안 설정(SecurityConfig)이 완료되기 전까지는
    //  SecurityContextHolder에 아무 값도 들어있지 않아 NullPointerException이 발생할 수 있음.
    //  또는 로그인하지 않은 상태면 principal이  ClassCastException 발생.
    
    
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