package project.oshiashi.oshiashi.domain.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;
import project.oshiashi.oshiashi.domain.user.service.UserService;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	/**
	 * 아이디 중복 확인
	 * GET /api/users/check-id?userId=test123
	 */
	@GetMapping("/check-id")
	public ResponseEntity<Boolean> checkId(@RequestParam("userId") String userId) {
		// 서비스에 중복 여부 확인을 위임하고 결과 반환함.
		return ResponseEntity.ok(userService.checkUserIdDuplicate(userId));
	}

	/**
	 * 닉네임 중복 확인
	 * GET /api/users/check-nickname?nickname=별명
	 */
	@GetMapping("/check-nickname")
	public ResponseEntity<Boolean> checkNickname(@RequestParam("nickname") String nickname) {
		// 닉네임 중복 여부를 서비스에서 가져와 반환함.
		return ResponseEntity.ok(userService.checkNicknameDuplicate(nickname));
	}

	/**
	 * 회원가입 처리
	 * POST /api/users/signup
	 * @RequestBody: 클라이언트가 보낸 JSON 데이터를 DTO 객체로 변환함.
	 */
	@PostMapping("/signup")
	public ResponseEntity<String> signUp(@RequestBody UserSignUpRequest request) {
		// 서비스의 가입 로직 실행함.
		userService.signUp(request);
		// 성공 시 200 OK와 메시지 반환함.
		return ResponseEntity.ok("회원가입이 완료되었습니다.");
	}

	/**
	 * 로그인 처리
	 * POST /api/users/login
	 */
	@PostMapping("/login")
	public ResponseEntity<String> login(@RequestBody UserLoginRequest request) {
		try {
			userService.login(request);
			return ResponseEntity.ok("로그인에 성공하였습니다.");
		} catch (IllegalArgumentException e) {
			// 아이디 없음 또는 비밀번호 불일치 시 에러 메시지 반환함.
			return ResponseEntity.status(401).body(e.getMessage());
		}
	}
}
