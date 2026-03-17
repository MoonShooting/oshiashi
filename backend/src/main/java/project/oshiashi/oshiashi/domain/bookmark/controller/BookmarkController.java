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
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    
    /**
     * 북마크 생성
     * POST /api/bookmarks
     */
    @PostMapping
    public ResponseEntity<BookmarkResponse> createBookmark(
            @RequestParam String userId,
            @RequestBody BookmarkCreateRequest request) {
        
        BookmarkResponse response = bookmarkService.createBookmark(userId, request);
        
        // 서비스에서 중복 등의 이유로 null을 반환했을 경우 (명세서 2번: 삽입 중단)
        if (response == null) {
            // 204 No Content 혹은 200 OK로 '변화 없음'을 알림
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        
        // 정상 생성 시 201 Created 응답
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    /**
     * 북마크 삭제
     * DELETE /api/bookmarks/{bookmarkId}
     */
    @DeleteMapping("/{bookmarkId}")
    public ResponseEntity<Void> deleteBookmark(
            @RequestParam String userId,
            @PathVariable Long bookmarkId) {
        
        bookmarkService.deleteBookmark(userId, bookmarkId);
        
        // 삭제 성공 시 204 No Content 반환
        return ResponseEntity.noContent().build();
    }
    
}