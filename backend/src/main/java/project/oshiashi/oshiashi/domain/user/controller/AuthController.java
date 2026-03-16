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
 * [AuthController: 인증 및 계정 관리 전담 컨트롤러]
 * /api/v1/auth/**
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	// 이메일 중복 확인: /api/v1/auth/checkEmail
	@GetMapping("/checkEmail")
	public ResponseEntity<Boolean> checkEmail(@RequestParam("email") String email) {
		log.info("[API] 이메일 중복 확인 호출.: {}", email);
		return ResponseEntity.ok(authService.isEmailDuplicated(email));
	}

	// 닉네임 중복 확인: /api/v1/auth/checkNickname
	@GetMapping("/checkNickname")
	public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
		log.info("[API] 닉네임 중복 확인 호출: {}", nickname);
		return ResponseEntity.ok(authService.isNicknameDuplicated(nickname));
	}

	// 아이디 중복 확인: /api/v1/auth/checkId
	@GetMapping("/checkId")
	public ResponseEntity<Boolean> checkId(@RequestParam("userId") String userId) {
		log.info("[API] 아이디 중복 확인 호출: {}", userId);
		return ResponseEntity.ok(authService.isUserIdDuplicated(userId));
	}

	// 비밀번호 확인: /api/v1/auth/checkPw
	@PostMapping("/checkPw")
	public ResponseEntity<String> checkPw(@RequestBody Map<String, String> request) {
		log.info("[API] 비밀번호 일치 여부 확인 요청");
		return ResponseEntity.ok("비밀번호 확인 완료");
	}

	// 이메일 인증번호 발송: /api/v1/auth/emailSend
	@PostMapping("/emailSend")
	public ResponseEntity<String> sendEmail(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		log.info("[API] 인증 메일 발송 요청: {}", email);
		authService.sendVerificationCode(email);
		return ResponseEntity.ok("인증번호가 발송되었습니다.");
	}

	// 이메일 인증 확인: /api/v1/auth/emailVerify
	@PostMapping("/emailVerify")
	public ResponseEntity<String> verifyEmail(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String code = request.get("code");
		log.info("[API] 인증 코드 검증 시도: {}", email);
		authService.verifyCode(email, code);
		return ResponseEntity.ok("인증에 성공하였습니다.");
	}

	// 회원가입 처리: /api/v1/auth/signup
	@PostMapping("/signup")
	public ResponseEntity<String> signUp(@RequestBody UserSignUpRequest request) {
		log.info("[API] 회원가입 요청 시작: {}", request.getUserId());
		authService.signUp(request);
		return ResponseEntity.ok("회원가입이 완료되었습니다.");
	}

	// 로그인 처리: /api/v1/auth/login
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody UserLoginRequest request) {
		log.info("[API] 로그인 시도: {}", request.getUserId());
		try {
			String token = authService.login(request);
			return ResponseEntity.ok(token);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.status(401).body(e.getMessage());
		}
	}

	// 로그아웃 처리: /api/v1/auth/logout
	@PostMapping("/logout")
	public ResponseEntity<String> logout(@RequestHeader("Authorization") String authHeader) {
		log.info("[API] 로그아웃 요청 감지");
		authService.logout(authHeader);
		return ResponseEntity.ok("성공적으로 로그아웃되었습니다.");
	}

	// 비밀번호 변경(로그인 상태): /api/v1/auth/password
	@PatchMapping("/password")
	public ResponseEntity<String> updatePassword(@RequestBody Map<String, String> request) {
		log.info("[API] 비밀번호 변경 요청(로그인 유저)");
		authService.updatePassword(request.get("oldPassword"), request.get("newPassword"));
		return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다.");
	}

	// 비밀번호 재설정 메일 발송: /api/v1/auth/passwordResetEmail
	@PostMapping("/passwordResetEmail")
	public ResponseEntity<String> sendResetEmail(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		log.info("[API] 비밀번호 재설정 메일 발송: {}", email);
		authService.sendVerificationCode(email);
		return ResponseEntity.ok("재설정 인증 메일이 발송되었습니다.");
	}

	// 비밀번호 재설정 확인: /api/v1/auth/passwordResetConfirm
	@PatchMapping("/passwordResetConfirm")
	public ResponseEntity<String> resetConfirm(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String newPassword = request.get("newPassword");
		log.info("[API] 비밀번호 재설정 완료 처리: {}", email);
		authService.resetPassword(email, newPassword);
		return ResponseEntity.ok("비밀번호 재설정이 완료되었습니다.");
	}

	// 회원 탈퇴: /api/v1/auth/withdraw
	@DeleteMapping("/withdraw")
	public ResponseEntity<String> withdraw() {
		log.info("[API] 회원 탈퇴 요청 수신");
		authService.withdraw();
		return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
	}
}