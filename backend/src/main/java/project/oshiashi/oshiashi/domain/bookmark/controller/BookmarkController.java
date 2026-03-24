package project.oshiashi.oshiashi.domain.bookmark.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkCreateRequest;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.service.BookmarkService;
import project.oshiashi.oshiashi.security.AuthenticatedUser;

import java.util.List;
import java.util.Map;

/**
 * [BookmarkController: 북마크 관리 전담 컨트롤러]
 * - 경로: /api/v1/bookmarks
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

	private final BookmarkService bookmarkService;

	/**
	 * [북마크 생성]
	 * - POST /api/v1/bookmarks
	 */
	@PostMapping
	// 북마크 생성은 request body의 userId를 신뢰하지 않고,
	// 로그인 토큰에서 추출한 사용자(authUser)를 기준으로 처리합니다.
	public ResponseEntity<BookmarkResponse> createBookmark(
			@AuthenticationPrincipal AuthenticatedUser authUser,
			@RequestBody BookmarkCreateRequest request) {

		log.info("[API] 북마크 생성 요청 - User: {}", authUser.getUsername());
		// 실제 북마크 소유자는 body가 아니라 인증된 사용자 ID(authUser.getUsername())로 결정합니다.
		BookmarkResponse response = bookmarkService.createBookmark(authUser.getUsername(), request);
		return ResponseEntity.ok(response);
	}

	/**
	 * [북마크 커스텀 이름 수정]
	 * - PATCH /api/v1/bookmarks/{bookmarkId}
	 * - 요구사항 5번: 북마크의 이름을 사용자가 원하는 이름으로 변경합니다.
	 */
	@PatchMapping("/{bookmarkId}")
	public ResponseEntity<String> updateBookmarkName(
			@AuthenticationPrincipal AuthenticatedUser authUser,
			@PathVariable Long bookmarkId,
			@RequestBody Map<String, String> request) {

		String newName = request.get("newName");
		log.info("[API] 북마크 이름 수정 요청 - ID: {}, NewName: {}", bookmarkId, newName);

		bookmarkService.updateBookmarkName(authUser.getUsername(), bookmarkId, newName);
		return ResponseEntity.ok("북마크 이름이 성공적으로 변경되었습니다.");
	}

	/**
	 * [북마크 삭제]
	 * - DELETE /api/v1/bookmarks/{bookmarkId}
	 */
	@DeleteMapping("/{bookmarkId}")
	public ResponseEntity<String> deleteBookmark(
			@AuthenticationPrincipal AuthenticatedUser authUser,
			@PathVariable Long bookmarkId) {

		log.info("[API] 북마크 삭제 요청 - ID: {}, User: {}", bookmarkId, authUser.getUsername());
		bookmarkService.deleteBookmark(authUser.getUsername(), bookmarkId);
		return ResponseEntity.ok("북마크가 삭제되었습니다.");
	}

	/**
	 * [내 북마크 목록 조회]
	 * - GET /api/v1/bookmarks
	 */
	@GetMapping
	// "내 북마크" 목록 조회이므로, 쿼리 파라미터 없이 현재 로그인 사용자 기준으로만 조회합니다.
	public ResponseEntity<List<BookmarkResponse>> getMyBookmarks(
			@AuthenticationPrincipal AuthenticatedUser authUser) {

		log.info("[API] 북마크 목록 조회 요청 - User: {}", authUser.getUsername());
		List<BookmarkResponse> responses = bookmarkService.getAllMyBookmarks(authUser.getUsername());
		return ResponseEntity.ok(responses);
	}
}