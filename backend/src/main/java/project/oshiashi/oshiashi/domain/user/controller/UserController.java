package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.achievement.dto.AchievementResponse;
import project.oshiashi.oshiashi.domain.achievement.service.AchievementService;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.user.dto.UserAchievementRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserAchievementResponse;
import project.oshiashi.oshiashi.domain.user.dto.UserProfileResponse;
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
	private final AchievementService achievementService;

	// 내 정보 상세 조회: /api/v1/user/me
	@GetMapping("/me")
	public ResponseEntity<UserResponse> getMyInfo() {
		log.info("[API] 내 정보 조회 호출!");
		return ResponseEntity.ok(userService.getMyInfo());
	}

	// 회원 프로필 요약 조회: /api/v1/user/profile
	@GetMapping("/profile")
	public ResponseEntity<UserProfileResponse> getUserProfile() {
		log.info("[API] 프로필 요약 조회 호출");
		return ResponseEntity.ok(userService.getUserProfile());
	}

	// 내 루트 목록 조회: /api/v1/user/myRoute
	@GetMapping("/myRoute")
	public ResponseEntity<List<RouteResponse>> getMyRoutes() {
		log.info("[API] 내 루트 목록 조회 호출");
		return ResponseEntity.ok(userService.getMyRoutes());
	}

	// 내가 쓴 글 목록 조회: /api/v1/user/posts
	@GetMapping("/posts")
	public ResponseEntity<List<PostResponse>> getMyPosts() {
		log.info("[API] 내가 쓴 글 조회 호출");
		return ResponseEntity.ok(userService.getMyPosts());
	}

	// 내가 쓴 댓글 목록 조회: /api/v1/user/comments
	@GetMapping("/comments")
	public ResponseEntity<List<CommentResponse>> getMyComments() {
		log.info("[API] 내가 쓴 댓글 조회 호출");
		return ResponseEntity.ok(userService.getMyComments());
	}

	// 북마크 목록 조회: /api/v1/user/myBookmarks
	@GetMapping("/myBookmarks")
	public ResponseEntity<List<BookmarkResponse>> getMyBookmarks() {
		log.info("[API] 북마크 조회 호출");
		return ResponseEntity.ok(userService.getMyBookmarks());
	}

	/**
	 * [내 보유 칭호 목록 조회]
	 * - 경로: /api/v1/user/achievement
	 * - 서비스 레이어에서 시큐리티를 통해 본인을 식별하므로 파라미터가 없습니다.
	 */
	@GetMapping("/achievement")
	public ResponseEntity<List<AchievementResponse>> getMyAchievements() {
		log.info("[API] 내 칭호 목록 조회 호출");

		// userService를 거칠 필요 없이 바로 achievementService를 호출하세요!
		return ResponseEntity.ok(achievementService.getAchievements());
	}

	/**
	 * [대표 칭호 변경]
	 * - API: PATCH /api/v1/user/mainAchievement
	 * - 피드백 반영:
	 * 1. Map 대신 전용 DTO(UserAchievementRequest)를 사용하여 타입 안정성 확보
	 * 2. 변경 후 최신 유저 정보(UserResponse)를 반환하여 프론트엔드 동기화 지원
	 */
	@PatchMapping("/mainAchievement")
	public ResponseEntity<UserResponse> updateMainAchievement(@RequestBody UserAchievementRequest request) {
		// 1. 요청 데이터에서 대상 ID 추출 (지역 변수 활용)
		Long achievementId = request.getAchievementId();
		log.info("[API] 대표 칭호 변경 호출 - 대상 ID: {}", achievementId);
		// 2. 서비스 호출: 대표 칭호를 변경하고 최신 유저 응답 객체를 받음
		UserResponse updatedUser = userService.updateMainAchievement(request);
		// 3. 변경된 유저 정보와 함께 200 OK 반환
		return ResponseEntity.ok(updatedUser);
	}

	// 특정 유저 요약 프로필 조회
	@GetMapping("/{userId}/profile")
	public ResponseEntity<UserProfileResponse> getUserProfileByUserId(@PathVariable String userId) {
		log.info("[API] 특정 유저 프로필 요약 조회 호출: {}", userId);
		return ResponseEntity.ok(userService.getUserProfileByUserId(userId));
	}

}