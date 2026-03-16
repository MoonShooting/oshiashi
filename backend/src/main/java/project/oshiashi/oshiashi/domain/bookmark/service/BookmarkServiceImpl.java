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
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final RouteRepository routeRepository;
    
    @Transactional
    public BookmarkResponse createBookmark(String userId, BookmarkCreateRequest request) {
        // 1. 유효성 체크: 최소 하나 이상의 대상(Post, Image, Route)이 있어야 함
        // 게시글, 이미지, 루트 중 참조 대상이 하나도 없으면 에러 발생
        if (request.getPostId() == null && request.getPostImageId() == null && request.getRouteId() == null) {
            log.debug("북마크할 대상이 없습니다");
            throw new IllegalArgumentException("북마크할 대상이 지정되지 않았습니다.");
        }
        
        // 2. 중복 체크: 동일 유저가 이미 동일한 콘텐츠를 북마크했는지 확인
        boolean isDuplicate = bookmarkRepository.existsCustom(
                request.getUserId(), request.getPostId(), request.getPostImageId(), request.getRouteId()
        );
        
        if (isDuplicate) {
            // 명세서에 따라 기존 데이터 유지 및 삽입 중단
            // 1. "기존 데이터를 유지하고" -> 이미 DB에 있는 데이터는 건드리지 않는다.
            // 2. "삽입을 중단하여" -> 새로 save()를 호출하지 않고 여기서 함수를 끝낸다(return).
            // 3. "데이터 중복 방지" -> 결과적으로 똑같은 북마크가 2개 생기지 않는다.
            log.debug("이미 존재하는 북마크입니다. 중단합니다.");
        }
        
        // 3. 저장
        BookmarkEntity bookmark = BookmarkEntity.builder()
                .bookmarkName(request.getBookmarkName())
                .user(userRepository.getReferenceById(request.getUserId()))
                .post(postRepository.getReferenceById(request.getPostId()))
                .postImage(postImageRepository.getReferenceById(request.getPostImageId()))
                .route(routeRepository.getReferenceById(request.getRouteId()))
                .build();
        
        BookmarkEntity savedBookmark = bookmarkRepository.save(bookmark);
        
        // 4. 리턴: 저장된 엔티티를 Response DTO로 변환하여 반환
        return BookmarkResponse.fromEntity(savedBookmark);
    }
    
    // TODO : 루트가 삭제될때도 북마크가 같이 삭제될것인가 에 대한 자세한 논의가 필요
    public void deleteBookmark(String userId, Long bookmarkId) {
        bookmarkRepository.deleteById(bookmarkId);
    }
    
}