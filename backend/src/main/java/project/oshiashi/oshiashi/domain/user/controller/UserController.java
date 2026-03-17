package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.user.dto.UserResponse;
import project.oshiashi.oshiashi.domain.user.service.UserService;

import java.util.List;
import java.util.Map;

/**
 * [UserController: 사용자 정보 및 활동 관리 컨트롤러]
 * - 담당 경로: /api/v1/user/**
 * - 역할: 마이페이지 정보 조회, 개인정보 수정, 사용자가 작성한 콘텐츠(글, 댓글 등) 목록 제공.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	// 내 정보 상세 조회: /api/v1/user/me
	@GetMapping("/me")
	public ResponseEntity<UserResponse> getMyInfo() {
		log.info("[API] 내 정보 조회 호출!");
		return ResponseEntity.ok(userService.getMyInfo());
	}

	// 회원 프로필 요약 조회: /api/v1/user/profile
	@GetMapping("/profile")
	public ResponseEntity<?> getUserProfile() {
		log.info("[API] 프로필 요약 조회 호출");
		return ResponseEntity.ok(userService.getUserProfile());
	}

	// 개인정보(닉네임 등) 수정: /api/v1/user/update
	@PatchMapping("/update")
	public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request) {
		String newNickname = request.get("nickname");
		log.info("[API] 프로필 수정 요청: {}", newNickname);
		try {
			userService.updateProfile(newNickname);
			return ResponseEntity.ok("프로필이 수정되었습니다.");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// 내 루트 목록 조회: /api/v1/user/myRoute
	@GetMapping("/myRoute")
	public ResponseEntity<List<?>> getMyRoutes() {
		log.info("[API] 내 루트 목록 조회 호출");
		return ResponseEntity.ok(userService.getMyRoutes());
	}

	// 내가 쓴 글 목록 조회: /api/v1/user/posts
	@GetMapping("/posts")
	public ResponseEntity<List<?>> getMyPosts() {
		log.info("[API] 내가 쓴 글 조회 호출");
		return ResponseEntity.ok(userService.getMyPosts());
	}

	// 내가 쓴 댓글 목록 조회: /api/v1/user/comments
	@GetMapping("/comments")
	public ResponseEntity<List<?>> getMyComments() {
		log.info("[API] 내가 쓴 댓글 조회 호출");
		return ResponseEntity.ok(userService.getMyComments());
	}

	// 북마크 목록 조회: /api/v1/user/bookmarks
	@GetMapping("/myBookmarks")
	public ResponseEntity<List<?>> getMyBookmarks() {
		log.info("[API] 북마크 조회 호출");
		return ResponseEntity.ok(userService.getMyBookmarks());
	}

	// 보유 칭호 목록 조회: /api/v1/user/achievement
	@GetMapping("/achievement")
	public ResponseEntity<List<?>> getMyAchievements() {
		log.info("[API] 칭호 목록 조회 호출");
		return ResponseEntity.ok(userService.getMyAchievements());
	}

	// 대표 칭호 변경: /api/v1/user/mainAchievement
	@PatchMapping("/mainAchievement")
	public ResponseEntity<String> updateMainAchievement(@RequestBody Map<String, Long> request) {
		Long achievementId = request.get("achievementId");
		log.info("[API] 대표 칭호 변경 호출: {}", achievementId);
		userService.updateMainAchievement(achievementId);
		return ResponseEntity.ok("대표 칭호가 변경되었습니다.");
	}
}