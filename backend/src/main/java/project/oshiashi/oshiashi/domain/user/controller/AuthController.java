package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
	public ResponseEntity<String> checkEmail(@RequestParam("email") String email) {
		log.info("[API] 이메일 중복 확인 호출: {}", email);
		try {
			authService.isEmailDuplicated(email); // 중복이면 예외 발생, 아니면 통과
			return ResponseEntity.ok("사용 가능한 이메일입니다.");
		} catch (IllegalArgumentException e) {
			// 서비스에서 던진 "이미 가입된..." 혹은 "형식이..." 메시지를 400 에러와 함께 보냄
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// 닉네임 중복 확인: /api/v1/auth/checkNickname
	@GetMapping("/checkNickname")
	public ResponseEntity<String> checkNickname(@RequestParam("nickname") String nickname) {
		log.info("[API] 닉네임 중복 확인 호출: {}", nickname);
		try {
			authService.isNicknameDuplicated(nickname);
			return ResponseEntity.ok("사용 가능한 닉네임입니다.");
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	// 아이디 중복 확인: /api/v1/auth/checkId
	@GetMapping("/checkId")
	public ResponseEntity<String> checkId(@RequestParam("userId") String userId) {
		log.info("[API] 아이디 중복 확인 호출: {}", userId);
		authService.isUserIdDuplicated(userId); // 예외 발생 시 GlobalHandler가 처리
		return ResponseEntity.ok("사용 가능한 아이디입니다.");
	}

	// 비밀번호 확인: /api/v1/auth/checkPw
	@PostMapping("/checkPw")
	public ResponseEntity<?> checkPw(@RequestBody Map<String, String> request) {
		log.info("[API] 비밀번호 일치 여부 확인 요청");
		String password = request.get("password");
		if (password == null || password.trim().isEmpty()) {
			return ResponseEntity.badRequest().body("비밀번호를 입력해주세요.");
		}
		boolean isMatch = authService.verifyCurrentPassword(password);
		// [추가 수정] 불일치 시 HTTP 상수를 사용하여 가독성 높임
		if (!isMatch) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
		}
		return ResponseEntity.ok(isMatch);
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
		// [보완] 서비스에서 발생한 에러는 GlobalExceptionHandler가 처리하도록 코드를 단순화함
		String token = authService.login(request);
		return ResponseEntity.ok(token);
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
		// [추가 수정] 가입 여부를 확인하는 전용 서비스 메서드 호출
		authService.sendPasswordResetCode(email);
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
	public ResponseEntity<String> withdraw(@RequestBody Map<String, String> request) {
		log.info("[API] 회원 탈퇴 요청 수신");
		authService.withdraw(request.get("password"));
		return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
	}

	@GetMapping("/findId")
	public ResponseEntity<String> findId(@RequestParam("email") String email) {
		log.info("[API] 아이디 찾기 요청: {}", email);
		// 서비스에서 마스킹된 아이디를 반환함 (예: test****)
		return ResponseEntity.ok(authService.findUserId(email));
	}
}