package project.oshiashi.oshiashi.domain.bookmark.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.service.BookmarkService;

import java.util.List;

@RestController
@RequiredArgsConstructor
// API 명세에 맞춰 수정
@RequestMapping("/api/v1/user/bookmarks")
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
}