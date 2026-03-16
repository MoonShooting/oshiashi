package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.constant.RedisKeys;
import project.oshiashi.oshiashi.security.AuthenticatedUser;
import project.oshiashi.oshiashi.security.JwtProvider;
import project.oshiashi.oshiashi.security.stmp.EmailVerificationEntity;
import project.oshiashi.oshiashi.security.stmp.EmailVerificationRepository;
import project.oshiashi.oshiashi.security.stmp.MailService;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;

/**
 * [AuthService: 사용자 인증 및 계정 관리 총괄 서비스]
 * - 역할: 회원가입, 로그인, 아이디/비밀번호 찾기, 계정 탈퇴 등 보안과 직결된 핵심 로직을 처리함.
 * - 주요 특징:
 * 1. 무상태(Stateless) 인증: 세션을 쓰지 않고 JWT 토큰을 발급하여 확장성을 확보함.
 * 2. Redis 연동: 인증번호 유효시간(TTL) 관리 및 '인증 성공 증표' 보관소로 활용함.
 * 3. 보안 강화: 비밀번호는 반드시 BCrypt로 해시화하며, 개인정보(ID)는 마스킹 처리하여 노출을 최소화함.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;
	private final EmailVerificationRepository verificationRepository;
	private final MailService mailService;
	private final StringRedisTemplate redisTemplate;

	// ==========================================
	// 1. 중복 검증 (Duplicate Checks)
	// ==========================================

	/**
	 * [아이디 중복 확인]
	 * - 클라이언트가 입력한 ID가 이미 DB(Primary Key)에 존재하는지 검사함.
	 */
	@Transactional(readOnly = true)
	public boolean isUserIdDuplicated(String userId) {
		log.debug("[AuthService] ID 중복 조회 시도: {}", userId);
		return userRepository.existsById(userId);
	}

	/**
	 * [닉네임 중복 확인]
	 * - 서비스 내 고유한 활동명을 보장하기 위해 유니크 제약조건을 기반으로 조회함.
	 */
	@Transactional(readOnly = true)
	public boolean isNicknameDuplicated(String nickname) {
		log.debug("[AuthService] 닉네임 중복 조회 시도: {}", nickname);
		return userRepository.existsByNickname(nickname);
	}

	/**
	 * [이메일 중복 확인]
	 * - 1인 1계정 원칙 및 이메일 인증 기반 보안을 위해 중복 여부를 확인함.
	 */
	@Transactional(readOnly = true)
	public boolean isEmailDuplicated(String email) {
		log.debug("[AuthService] 이메일 중복 조회 시도: {}", email);
		return userRepository.existsByEmail(email);
	}

	// ==========================================
	// 2. 가입 및 로그인 (SignUp & Login)
	// ==========================================

	/**
	 * [회원가입 프로세스]
	 * 1. 보안 체크: Redis에 10분간 유효한 '인증 성공 증표'가 있는지 확인함.
	 * 2. 무결성 체크: ID, 닉네임, 이메일이 그새 다른 유저에 의해 선점되지 않았는지 재검증함.
	 * 3. 암호화: 비밀번호를 BCrypt로 인코딩하여 DB 유출 시에도 안전하게 보호함.
	 * 4. 저장: 최종 유저 엔티티를 생성하여 영구 저장함.
	 */
	@Transactional
	public void signUp(UserSignUpRequest request) {
		log.info("[AuthService] 회원가입 프로세스 시작 - UserID: {}", request.getUserId());

		// 1. 이메일 인증 여부 확인 (신뢰할 수 있는 요청인지 체크)
		validateEmailVerification(request.getEmail());

		// 2. 최종 중복 데이터 검증
		validateDuplicateData(request);

		// 3. 비밀번호 암호화 및 유저 생성
		UserEntity newUser = UserEntity.builder()
				.userId(request.getUserId())
				.name(request.getName())
				.password(passwordEncoder.encode(request.getPassword())) // 암호화 필수
				.email(request.getEmail())
				.nickname(request.getNickname())
				.createdAt(LocalDateTime.now())
				.build();

		userRepository.save(newUser);
		log.info("[AuthService] 회원가입 성공 - DB 저장 완료: {}", newUser.getUserId());
	}
	
	/**
	 * [데이터 중복 일괄 검증] -> signup에서 호출하는 용도로 사용
	 */
	private void validateDuplicateData(UserSignUpRequest request) {
		if (isUserIdDuplicated(request.getUserId())) throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
		if (isNicknameDuplicated(request.getNickname())) throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
		if (isEmailDuplicated(request.getEmail())) throw new IllegalArgumentException("이미 가입된 이메일입니다.");
	}

	/**
	 * [로그인 및 자격 증명]
	 * 1. 식별: 입력된 ID로 DB에서 사용자 정보를 인출함.
	 * 2. 인증: 암호화된 비밀번호와 입력된 평문 비밀번호를 matches() 메서드로 대조함.
	 * 3. 인가: 인증 성공 시, 유저 식별자(userId)를 담은 JWT Access Token을 생성하여 반환함.
	 */
	@Transactional(readOnly = true)
	public String login(UserLoginRequest request) {
		log.info("[AuthService] 로그인 시도 - UserID: {}", request.getUserId());

		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			log.warn("[AuthService] 로그인 실패: 비밀번호 불일치 - UserID: {}", request.getUserId());
			throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
		}

		// 무상태 환경에서의 통행증(JWT) 발급
		String token = jwtProvider.createToken(user.getUserId());
		log.info("[AuthService] 로그인 성공 - JWT 발급 완료");
		return token;
	}

	// ==========================================
	// 3. 계정 정보 찾기 (Recovery)
	// ==========================================

	/**
	 * [아이디 찾기]
	 * - 절차: 이메일 인증 -> 유저 조회 -> 아이디 일부 마스킹 처리 -> 반환.
	 * - 장점: 개인정보 보호를 위해 전체 아이디를 노출하지 않고 별표(*) 처리함.
	 */
	@Transactional(readOnly = true)
	public String findUserId(String email) {
		log.debug("[AuthService] 아이디 찾기 요청 - 이메일: {}", email);
		validateEmailVerification(email);

		return userRepository.findByEmail(email)
				.map(user -> {
					log.debug("[AuthService] 아이디 검색 성공 - 마스킹 처리 진행");
					return maskUserId(user.getUserId());
				})
				.orElseThrow(() -> new IllegalArgumentException("가입 정보가 없는 이메일입니다!"));
	}

	/**
	 * [아이디 마스킹 내부 로직]
	 * - 규칙: 아이디가 짧으면(3자 이하) 앞자리만, 길면 앞 5자만 보여주고 나머지는 별표(*) 처리.
	 */
	private String maskUserId(String userId) {
		if (userId.length() <= 3) {
			return userId.substring(0, 1) + "**";
		}
		int visibleLength = Math.min(userId.length(), 5);
		String visiblePart = userId.substring(0, visibleLength);
		int maskCount = userId.length() - visibleLength;
		return visiblePart + "*".repeat(maskCount);
	}

	// ==========================================
	// 4. 이메일 인증 시스템 (Email Verification)
	// ==========================================

	/**
	 * [인증번호 발송]
	 * 1. 횟수 제한: 하루 최대 5회까지만 발송을 허용하여 서버 리소스 및 비용을 방어함.
	 * 2. 쿨타임 적용: Redis TTL을 확인하여 1분 이내 재요청 시 차단함(도배 방지).
	 * 3. Redis 저장: 6자리 난수를 3분간 유효하게 저장함.
	 * 4. 이력 기록: DB에는 실제 번호 대신 마스킹 값을 넣어 데이터 오남용을 방지함.
	 */
	@Transactional
	public void sendVerificationCode(String email) {
		log.info("[Email Auth] 인증번호 발송 요청 - To: {}", email);

		// 하루 발송 횟수 제한 (MySQL 기반 카운트)
		LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
		long requestCount = verificationRepository.countByEmailAndCreatedAtAfter(email, startOfToday);
		if (requestCount >= 5) {
			throw new IllegalArgumentException("일일 인증 횟수(5회)를 초과했습니다. 내일 다시 시도해주세요.");
		}

		// 1분 재요청 방지 (Redis TTL 활용)
		Long expireTime = redisTemplate.getExpire(RedisKeys.AUTH_CODE + email, TimeUnit.SECONDS);
		if (expireTime != null && expireTime > 120) {
			throw new IllegalArgumentException("이미 인증 메일을 발송했습니다. 1분 후 다시 시도해주세요.");
		}

		// 6자리 난수 생성 및 Redis 기록 (3분 유효)
		String authCode = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
		redisTemplate.opsForValue().set(RedisKeys.AUTH_CODE + email, authCode, Duration.ofMinutes(3));

		// DB에는 발송 이력만 저장 (보안을 위해 실제 코드는 숨김)
		verificationRepository.save(EmailVerificationEntity.builder()
				.email(email).authCode("******").createdAt(LocalDateTime.now()).build());

		// 비동기 메일 발송 서비스 호출
		mailService.sendVerificationEmail(email, authCode);
		log.info("[Email Auth] 메일 발송 완료");
	}

	/**
	 * [인증번호 검증]
	 * 1. 일치 확인: Redis에 저장된 번호와 유저가 입력한 번호를 대조함.
	 * 2. 상태 전환: 번호가 일치하면 '인증번호'는 삭제하고, '인증 성공 증표(verified:email)'를 10분간 발행함.
	 * 3. 결과: 이 10분짜리 증표가 있어야 회원가입이나 비번 재설정이 가능함.
	 */
	@Transactional
	public void verifyCode(String email, String code) {
		String savedCode = redisTemplate.opsForValue().get(RedisKeys.AUTH_CODE + email);

		if (savedCode == null) throw new IllegalArgumentException("인증 시간이 만료되었습니다.");
		if (!savedCode.equals(code)) throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");

		// 검증 성공 처리
		redisTemplate.delete(RedisKeys.AUTH_CODE + email); // 번호는 1회성임
		redisTemplate.opsForValue().set(RedisKeys.VERIFIED_EMAIL + email, "true", Duration.ofMinutes(10));
		log.info("[Email Auth] 검증 성공 - 10분 유효 증표 발행 완료: {}", email);
	}

	// ==========================================
	// 5. 계정 관리 (CUD)
	// ==========================================

	/**
	 * [비밀번호 재설정]
	 * - 대상: 로그인을 할 수 없는 유저(비번 분실).
	 * - 전제조건: 이메일 인증을 통해 발행된 10분짜리 '증표'가 Redis에 있어야 함.
	 */
	@Transactional
	public void resetPassword(String email, String newPassword) {
		log.info("[AuthService] 비밀번호 재설정 프로세스 - Target: {}", email);
		validateEmailVerification(email);

		UserEntity user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));

		user.changePassword(passwordEncoder.encode(newPassword));
		redisTemplate.delete("verified:" + email); // 사용된 증표 폐기
		log.info("[AuthService] 비밀번호 재설정 완료");
	}

	/**
	 * [비밀번호 변경]
	 * - 대상: 로그인한 상태의 유저.
	 * - 확인: 본인 확인을 위해 '현재 비밀번호'를 반드시 재확인함.
	 */
	@Transactional
	public void updatePassword(String oldPassword, String newPassword) {
		UserEntity user = getCurrentUserEntity(); // 현재 로그인한 정보 인출

		if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
			throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
		}

		user.changePassword(passwordEncoder.encode(newPassword));
		log.info("[AuthService] 로그인 유저 비밀번호 변경 완료: {}", user.getUserId());
	}

	/**
	 * [회원 탈퇴]
	 * - 현재 로그인한 유저를 DB에서 영구 삭제함.
	 * - 주의: 탈퇴 시 게시글/댓글 처리 정책(Cascade 등)은 JPA 설정을 따름.
	 */
	@Transactional
	public void withdraw() {
		UserEntity user = getCurrentUserEntity();
		log.info("[AuthService] 회원 탈퇴 진행 - UserID: {}", user.getUserId());
		userRepository.delete(user);
	}

	// ==========================================
	// 6. 내부 보안 유틸리티 (Helpers)
	// ==========================================

	/**
	 * [현재 로그인 유저 엔티티 가져오기]
	 * - 시큐리티 컨텍스트에서 인증 객체를 꺼내와 실제 유저 데이터로 변환해주는 다리 역할을 함.
	 */
	private UserEntity getCurrentUserEntity() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
			throw new IllegalStateException("인증 정보가 없습니다. 다시 로그인해주세요.");
		}
		return authenticatedUser.user();
	}

	/**
	 * [이메일 인증 증표 존재 여부 확인]
	 * - 회원가입, 비번 재설정 등 주요 로직 전단에서 호출하여 보안을 강화함.
	 */
	private void validateEmailVerification(String email) {
		Boolean isVerified = redisTemplate.hasKey("verified:" + email);
		if (isVerified == null || !isVerified) {
			throw new IllegalArgumentException("이메일 인증이 완료되지 않았습니다.");
		}
	}

	/**
	 * [로그아웃: logout]
	 * - JWT는 서버에서 삭제가 불가능하므로, Redis 블랙리스트에 등록하여 남은 시간 동안 무효화함.
	 *
	 * @param authHeader "Bearer {token}" 형태의 헤더 값
	 */
	@Transactional
	public void logout(String authHeader) {
		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			throw new IllegalArgumentException("유효하지 않은 토큰 헤더입니다.");
		}

		String token = authHeader.substring(7); // "Bearer " 제거

		// 1. 토큰의 남은 유효 기간(TTL) 계산
		long expiration = jwtProvider.getExpiration(token);

		if (expiration > 0) {
			// 2. Redis에 'blacklist:토큰' 저장 (남은 시간만큼만 보관 후 자동 삭제)
			redisTemplate.opsForValue().set(
					"blacklist:" + token,
					"logout",
					Duration.ofMillis(expiration)
			);
			log.info("[Logout] 블랙리스트 등록 완료 - 남은 시간: {}ms", expiration);
		}
	}
}