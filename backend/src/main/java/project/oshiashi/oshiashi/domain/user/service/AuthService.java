package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserResponse;
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

	// 유지보수를 위한 정규식 상수화
	private static final String ID_REGEX = "^[a-z0-9]{4,20}$";
	private static final String PW_REGEX = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,20}$";
	private static final String NICK_REGEX = "^[a-zA-Z0-9가-힣]{2,12}$";
	private static final String EMAIL_REGEX = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";

	/**
	 * [아이디 중복 확인]
	 * 1. 형식 검사: 규격에 맞지 않으면 예외 발생
	 * 2. 중복 검사: DB에 존재하면 예외 발생
	 */
	@Transactional(readOnly = true)
	public boolean isUserIdDuplicated(String userId) {
		log.info("[AuthService] ID 중복 조회 시도: {}", userId);
		// [수정] 공통 검증 메서드 호출
		validateIdFormat(userId);
		// [수정 포인트] 결과를 변수에 담아 로그로 출력
		boolean exists = userRepository.existsById(userId);
		if (exists) {
			log.warn("[AuthService] 중복 체크 결과: '{}'는 이미 존재함 (중복)", userId);
			throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
		} else {
			log.info("[AuthService] 중복 체크 결과: '{}'는 사용 가능 (미중복)", userId);
		}
		return exists;
	}

	/**
	 * [닉네임 중복 확인]
	 */
	@Transactional(readOnly = true)
	public boolean isNicknameDuplicated(String nickname) {
		log.info("[AuthService] 닉네임 중복 조회 시도: {}", nickname);

		// [수정] 공통 검증 메서드 호출
		validateNicknameFormat(nickname);

		boolean exists = userRepository.existsByNickname(nickname);
		if (exists) {
			log.warn("[AuthService] 중복 체크 결과: 닉네임 '{}'은 이미 사용 중 (중복)", nickname);
			throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
		} else {
			log.info("[AuthService] 중복 체크 결과: 닉네임 '{}'은 사용 가능 (미중복)", nickname);
		}
		return exists;
	}

	/**
	 * [이메일 중복 확인]
	 */
	@Transactional(readOnly = true)
	public boolean isEmailDuplicated(String email) {
		log.info("[AuthService] 이메일 중복 조회 시도: {}", email);

		// [수정] 공통 검증 메서드 호출
		validateEmailFormat(email);

		boolean exists = userRepository.existsByEmail(email);
		if (exists) {
			log.warn("[AuthService] 중복 체크 결과: 이메일 '{}'은 이미 가입됨 (중복)", email);
			throw new IllegalArgumentException("이미 가입된 이메일입니다.");
		} else {
			log.info("[AuthService] 중복 체크 결과: 이메일 '{}'은 사용 가능 (미중복)", email);
		}
		return exists;
	}

	/**
	 * [회원가입 프로세스]
	 * 1. 보안 체크: Redis에 10분간 유효한 '인증 성공 증표'가 있는지 확인함.
	 * 2. 무결성 체크: ID, 닉네임, 이메일이 그새 다른 유저에 의해 선점되지 않았는지 재검증함.
	 * 3. 암호화: 비밀번호를 BCrypt로 인코딩하여 DB 유출 시에도 안전하게 보호함.
	 * 4. 저장: 최종 유저 엔티티를 생성하여 영구 저장함.
	 * [최종 중복 데이터 재검증을 수행하는 이유]
	 * 1. 틈새 시간 방어(동시성): '중복 확인' 통과 후 '가입 완료'를 누르는 몇 분 사이, 다른 사람이 해당 정보로 선점할 수 있음.
	 * 2. API 독립성(보안): 악의적 사용자가 중복 확인 API를 건너뛰고 비정상 데이터를 담아 회원가입 API만 직접 호출할 수 있음.
	 * 3. 결론: 따라서 DB 영구 저장 직전, 가장 최신 상태의 DB를 기준으로 모든 무결성을 최후로 교차 검증해야 함.
	 * */
	@Transactional
	public void signUp(UserSignUpRequest request) {
		log.info("[AuthService] 회원가입 프로세스 시작 - UserID: {}", request.getUserId());
		validateRequestFormat(request);
		validateEmailVerification(request.getEmail());
		validateDuplicateData(request);
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
	 * [프론트엔드 규격 동기화 검증 로직]
	 * - 프론트엔드의 validate 함수 내 각 case별 정규식 및 에러 메시지를 자바 코드로 구현함.
	 * - 자바 matches()는 전체 일치를 검사하므로 프론트엔드의 .test()와 동일하게 작동함.
	 * - 클라이언트 검증 우회 공격을 막기 위한 2차 방어선 역할을 수행함.
	 */
	private void validateRequestFormat(UserSignUpRequest request) {
		// [수정] 개별 검증 메서드 호출로 간소화
		validateIdFormat(request.getUserId());
		validatePasswordFormat(request.getPassword());
		validateNicknameFormat(request.getNickname());
		validateEmailFormat(request.getEmail());
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
		// 1. 발송 횟수 제한 확인
		LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
		long requestCount = verificationRepository.countByEmailAndCreatedAtAfter(email, startOfToday);
		if (requestCount >= 5) {
			throw new IllegalArgumentException("일일 인증 횟수(5회)를 초과했습니다. 내일 다시 시도해주세요.");
		}
		// 2. 1분 재요청 방지
		Long expireTime = redisTemplate.getExpire(RedisKeys.AUTH_CODE + email, TimeUnit.SECONDS);
		if (expireTime != null && expireTime > 120) {
			throw new IllegalArgumentException("이미 인증 메일을 발송했습니다. 1분 후 다시 시도해주세요.");
		}
		// 3. 6자리 난수 생성 및 Redis 기록 (3분 유효)
		String authCode = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
		redisTemplate.opsForValue().set(RedisKeys.AUTH_CODE + email, authCode, Duration.ofMinutes(3));
		// [수정 포인트] DB 저장 시 expiryDate 누락으로 인한 500 에러 해결
		// EmailVerificationEntity에 @PrePersist를 적용했다면 아래대로만 써도 되고,
		// 만약 확실하게 하고 싶다면 .expiryDate(LocalDateTime.now().plusMinutes(5))를 명시해도 좋습니다.
		verificationRepository.save(EmailVerificationEntity.builder()
				.email(email)
				.authCode("******")
				.createdAt(LocalDateTime.now())
				.expiryDate(LocalDateTime.now().plusMinutes(5)) // [추가] 만료 시간 명시적 추가
				.build());
		// 4. 비동기 메일 발송 서비스 호출
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
		redisTemplate.delete(RedisKeys.AUTH_CODE + email);
		redisTemplate.opsForValue().set(RedisKeys.VERIFIED_EMAIL + email, "true", Duration.ofMinutes(10));
		log.info("[Email Auth] 검증 성공 - 10분 유효 증표 발행 완료: {}", email);
	}

	/**
	 * [비밀번호 재설정 - RESET]
	 * - 수정 포인트: 새 비밀번호의 형식을 검사하는 로직을 추가하여 보안성을 높였습니다.
	 */
	@Transactional
	public void resetPassword(String email, String newPassword) {
		log.info("[AuthService] 비밀번호 재설정(Reset) 시작 - 대상: {}", email);
		// 1. Redis에서 이 사람이 이메일 인증을 통과했는지 최종 확인
		validateEmailVerification(email);
		// [수정] 공통 검증 메서드 호출
		validatePasswordFormat(newPassword);
		// 2. DB에서 유저 조회 (이메일 기준)
		UserEntity user = userRepository.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));
		// 3. 새 비밀번호 암호화 후 반영
		user.changePassword(passwordEncoder.encode(newPassword));
		// 4. 사용한 인증 증표 폐기 (재사용 방지)
		// [추가 수정] RedisKeys.VERIFIED_EMAIL 상수를 사용하여 일관성을 유지합니다.
		redisTemplate.delete(RedisKeys.VERIFIED_EMAIL + email);

		log.info("[AuthService] 비밀번호 재설정 완료 - UserID: {}", user.getUserId());
	}

	/**
	 * [비밀번호 재설정용 인증번호 발송]
	 * - 기존 로직 유지
	 */
	@Transactional
	public void sendPasswordResetCode(String email) {
		log.info("[Email Auth] 비밀번호 재설정용 메일 발송 요청 - To: {}", email);

		if (!userRepository.existsByEmail(email)) {
			log.warn("[Email Auth] 가입되지 않은 이메일로 비번 재설정 시도: {}", email);
			throw new IllegalArgumentException("해당 이메일로 가입된 정보가 없습니다. 다시 확인해주세요.");
		}

		this.sendVerificationCode(email);
		log.info("[Email Auth] 비밀번호 재설정용 메일 발송 완료: {}", email);
	}

	/**
	 * [비밀번호 변경 - CHANGE]
	 * 보완: 새 비밀번호가 보안 규격(영문+숫자+특수문자)에 맞는지 검증 로직 추가
	 */
	@Transactional
	public void updatePassword(String oldPassword, String newPassword) {
		String userId = getCurrentUserEntity().getUserId();

		// [수정] 공통 검증 메서드 호출
		validatePasswordFormat(newPassword);

		UserEntity managedUser = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));
		if (!passwordEncoder.matches(oldPassword, managedUser.getPassword())) {
			throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
		}
		managedUser.changePassword(passwordEncoder.encode(newPassword));
	}

	/**
	 * [개인정보(닉네임) 수정]
	 * - API: /api/v1/auth/update
	 * - 용도: 사용자의 닉네임을 검증 후 업데이트합니다.
	 * - 설계: 비밀번호 변경과 분리하여 일반 프로필 수정만 담당하며, 더티 체킹을 활용합니다.
	 */
	@Transactional
	public void updateProfile(String newNickname) {
		// 1. 현재 세션의 유저 정보 가져오기
		UserEntity sessionUser = getCurrentUserEntity();
		log.info("[AuthService] 닉네임 변경 요청 - UserID: {}, 시도 닉네임: {}", sessionUser.getUserId(), newNickname);

		// 2. 기존 닉네임과 동일한지 체크 (불필요한 DB 작업 방지)
		if (sessionUser.getNickname().equals(newNickname)) {
			log.info("[AuthService] 기존 닉네임과 동일하여 변경을 생략합니다.");
			return;
		}

		// 3. [수정 포인트] 이미 아래에 만들어진 공통 검증 메서드 호출
		validateNicknameFormat(newNickname);

		// 4. 영속성 컨텍스트에 관리되는 실제 유저 엔티티 조회
		UserEntity managedMe = userRepository.findById(sessionUser.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));

		// 5. 닉네임 중복 검사 (타인이 사용 중인지 확인)
		if (userRepository.existsByNickname(newNickname)) {
			throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
		}

		// 6. 엔티티 정보 수정 (JPA 더티 체킹)
		managedMe.changeNickname(newNickname);

		log.info("[AuthService] 닉네임 변경 완료 - UserID: {}, NewNickname: {}", managedMe.getUserId(), newNickname);
	}

	/**
	 * [회원 탈퇴 - 보안 강화 버전]
	 * 1. 현재 로그인한 유저 확인
	 * 2. 입력받은 비밀번호와 DB 비밀번호 대조
	 * 3. 일치할 경우에만 DB에서 삭제 (영속성 컨텍스트 보장)
	 */
	@Transactional
	public void withdraw(String rawPassword) {
		// 1. 시큐리티 컨텍스트에서 유저 ID 추출
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (!(principal instanceof AuthenticatedUser authUser)) {
			throw new IllegalStateException("인증 정보가 없습니다. 다시 로그인해주세요.");
		}
		String userId = authUser.getUsername();
		log.info("[AuthService] 회원 탈퇴 요청 - UserID: {}", userId);
		// 2. [해결 포인트] DB에서 최신 엔티티를 직접 조회 (삭제 보장을 위해)
		UserEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
		// 3. [추가] 비밀번호 재검증 로직
		if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
			log.warn("[AuthService] 탈퇴 실패: 비밀번호 불일치 - UserID: {}", userId);
			throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
		}
		// 4. [해결 포인트] 조회한 엔티티를 삭제 (이제 확실히 DELETE 쿼리가 나갑니다)
		userRepository.delete(user);
		log.info("[AuthService] 회원 탈퇴 완료 - DB에서 영구 삭제됨: {}", userId);
	}

	/**
	 * [현재 비밀번호 일치 여부 단순 확인]
	 * - 정보 수정이나 탈퇴 전, 본인 확인을 위해 사용됨.
	 * - 로그인(토큰 발급)이나 비밀번호 변경(DB 수정) 같은 부가 작업 없이, 오직 입력한 비밀번호가 맞는지(true/false)만 검사.
	 *
	 */
	@Transactional(readOnly = true)
	public boolean verifyCurrentPassword(String rawPassword) {
		// 1. 현재 로그인한 유저의 ID 가져오기
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (!(principal instanceof AuthenticatedUser authUser)) {
			throw new IllegalStateException("인증 정보가 없습니다.");
		}
		String userId = authUser.getUsername();
		// 2. [핵심] DB에서 최신 엔티티를 직접 조회
		UserEntity user = userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("유저 정보를 찾을 수 없습니다."));
		// 3. 비교 결과 반환
		boolean isMatch = passwordEncoder.matches(rawPassword, user.getPassword());
		log.info("[AuthService] 비밀번호 확인 수행 - UserID: {}, 결과: {}", userId, isMatch ? "일치" : "불일치");
		return isMatch;
	}

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
		Boolean isVerified = redisTemplate.hasKey(RedisKeys.VERIFIED_EMAIL + email);
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
	/**
	 * [내 정보 조회: getMyInfo]
	 * - 역할: 현재 유효한 토큰을 가진 사용자의 상세 정보를 반환함.
	 * - 특징:
	 * 1. 프론트엔드 새로고침 시 Zustand 등 전역 상태를 복구하는 핵심 API.
	 * 2. 보안 컨텍스트(SecurityContext)에서 인증 객체를 꺼내와 실시간 유저 상태를 확인.
	 *
	 * @return 인증된 사용자의 상세 정보 (UserResponse)
	 */
	@Transactional(readOnly = true) // 단순 조회이므로 성능 최적화 및 데이터 무결성 보장
	public UserResponse getMyInfo() {
		// 1. 현재 보안 컨텍스트에 저장된 인증 정보로부터 유저 엔티티를 획득
		UserEntity user = getCurrentUserEntity();
		// 2. 로그 기록: 어떤 사용자가 상태 복구를 시도하는지 기록
		log.info("[AuthService] 내 정보 조회(상태 복구) 요청 - UserID: {}, Nickname: {}",
				user.getUserId(), user.getNickname());
		// 3. 획득한 엔티티를 클라이언트 응답용 DTO(UserResponse)로 변환하여 최종 반환
		return UserResponse.fromEntity(user);
	}

	// 아이디 형식 검증
	private void validateIdFormat(String userId) {
		if (userId == null || !userId.matches(ID_REGEX)) {
			throw new IllegalArgumentException("4~20자의 영문 소문자, 숫자만 가능합니다.");
		}
	}
	//  비밀번호 형식 검증
	private void validatePasswordFormat(String password) {
		if (password == null || !password.matches(PW_REGEX)) {
			throw new IllegalArgumentException("8~20자의 영문, 숫자, 특수문자를 포함해야 합니다.");
		}
	}
	//  닉네임 형식 검증
	private void validateNicknameFormat(String nickname) {
		if (nickname == null || !nickname.matches(NICK_REGEX)) {
			throw new IllegalArgumentException("2~12자의 한글, 영문, 숫자만 가능합니다.");
		}
	}
	//  이메일 형식 검증
	private void validateEmailFormat(String email) {
		if (email == null || !email.matches(EMAIL_REGEX)) {
			throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
		}
	}
}