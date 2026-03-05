package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;
import project.oshiashi.oshiashi.domain.user.service.AuthService;

/**
 * [인증 전담 컨트롤러]
 * 설계서 경로: /api/v1/auth/**
 * 담당 기능: 아이디/닉네임 중복 확인, 회원가입, 로그인
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	/**
	 * 아이디 중복 확인
	 */
	@GetMapping("/check-id")
	public ResponseEntity<Boolean> checkId(@RequestParam("userId") String userId) {
		return ResponseEntity.ok(authService.isUserIdDuplicated(userId));
	}

	/**
	 * 닉네임 중복 확인
	 * GET /api/v1/auth/check-nickname?nickname=별명
	 */
	@GetMapping("/check-nickname")
	public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
		return ResponseEntity.ok(authService.isNicknameDuplicated(nickname));
	}

	/**
	 * 회원가입 처리
	 * POST /api/v1/auth/signup
	 */
	@PostMapping("/signup")
	public ResponseEntity<String> signUp(@RequestBody UserSignUpRequest request) {
		authService.signUp(request);
		return ResponseEntity.ok("회원가입이 완료되었습니다.");
	}

	/**
	 * 로그인 처리
	 * POST /api/v1/auth/login
	 */
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody UserLoginRequest request) {
		try {
			String token = authService.login(request);
			return ResponseEntity.ok(token);
		} catch (IllegalArgumentException e) {
			// 여기서 서비스가 던진 "존재하지 않는 아이디입니다" 또는 "비밀번호가 일치하지 않습니다"가 그대로 출력됨
			return ResponseEntity.status(401).body(e.getMessage());
		}
	}
//	TODO: 회원 탈퇴 (DELETE /api/v1/user/withdraw)
}