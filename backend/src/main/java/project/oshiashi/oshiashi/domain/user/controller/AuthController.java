package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;
import project.oshiashi.oshiashi.domain.user.service.AuthService;

import java.util.Map;

/**
 * [인증 전담 컨트롤러]
 * 설계서 경로: /api/v1/auth/**
 * 담당 기능: 아이디/닉네임 중복 확인, 회원가입, 로그인
 */
@Slf4j
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
	 * 이메일 인증 문자 발송
	 * POST /api/v1/auth/email-send
	 */
	@PostMapping("/email-send")
	public ResponseEntity<String> sendEmail(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		authService.sendVerificationCode(email);
		return ResponseEntity.ok("인증번호가 발송되었습니다.");
	}

	/**
	 * 이메일 인증 확인
	 * POST /api/v1/auth/emailVerify
	 */
	@PostMapping("/email-verify")
	public ResponseEntity<String> verifyEmail(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String code = request.get("code");
		authService.verifyCode(email, code); // 인증 성공 시 true 반환 or 예외 발생
		return ResponseEntity.ok("인증에 성공하였습니다.");
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
//	TODO: 개인정보 수정 (PATCH /api/v1/user/update)
}