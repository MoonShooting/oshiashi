package project.oshiashi.oshiashi.domain.bookmark.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.service.BookmarkService;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
// API 명세에 맞춰 수정
@RequestMapping("/api/v1")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    // 북마크 생성
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookmarkResponse createBookmark(
            @RequestParam String userId,
            @RequestBody BookmarkCreateRequest request
    ) {
        return bookmarkService.createBookmark(userId, request);
    }

    // 북마크 목록 조회
    @GetMapping
    public List<BookmarkResponse> getBookmarks(@RequestParam String userId) {
        return bookmarkService.getBookmarksByUser(userId);
    }

    // 북마크 삭제
    @DeleteMapping("/{bookmarkId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBookmark(
            @PathVariable Long bookmarkId,
            @RequestParam String userId
    ) {
        bookmarkService.deleteBookmark(userId, bookmarkId);
    }
    
    /**
     * 1) 북마크 토글 (ON/OFF)
     * POST /api/v1/posts/{postId}/bookmark
     * 결과: true(북마크 됨), false(북마크 해제됨)
     */
    @PostMapping("/posts/{postId}/bookmark")
    public ResponseEntity<Boolean> toggleBookmark(@PathVariable Long postId) {
        log.debug("북마크 토글 요청 - 게시글 ID: {}", postId);
        boolean isBookmarked = bookmarkService.toggleBookmark(postId);
        return ResponseEntity.ok(isBookmarked);
    }
    
    /**
     * 2) 내 북마크 목록 조회 (마이페이지용)
     * 마이페이지에서 북마크 조회 누르면 작동합니
     */
    @GetMapping("user/bookmarks")
    public ResponseEntity<List<PostResponse>> getMyBookmarks() {
        log.debug("내 북마크 목록 조회 요청");
        List<PostResponse> myBookmarks = bookmarkService.getMyBookmarks();
        return ResponseEntity.ok(myBookmarks);
    }
}