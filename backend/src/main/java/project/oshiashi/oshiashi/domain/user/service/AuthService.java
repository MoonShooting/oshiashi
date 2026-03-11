package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.constant.RedisKeys;
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
 * [AuthService: 인증 관문 서비스]
 * - 역할: 회원가입 시의 자격 부여, 로그인 시의 자격 검증 및 JWT 발급을 전담함.
 * - 설계서 경로: /api/v1/auth/** 관련 비즈니스 로직 처리함.
 * - Redis 로컬에서 설치가 완료되었다면, redis-cli ping 을 입력 시, pong 이라고 나옵니다.
 * - 로직 확인 시, keys *로 하면 3분 후 사라지는 인증 6자리가 발급되는걸 확인 가능합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;
	private final EmailVerificationRepository verificationRepository;
	private final MailService mailService; //메일 발송 서비스
	private final StringRedisTemplate redisTemplate; //redis 템플릿(key-value string)


	/** * [아이디 중복 확인]
	 * - 가입 폼 입력 시 실시간 중복 체크를 위해 사용됨.
	 */
	@Transactional(readOnly = true)
	public boolean isUserIdDuplicated(String userId) {
		return userRepository.existsById(userId);
	}

	/** * [닉네임 중복 확인]
	 * - 서비스 내 유일한 닉네임을 보장하기 위해 사용됨.
	 */
	@Transactional(readOnly = true)
	public boolean isNicknameDuplicated(String nickname) {
		return userRepository.existsByNickname(nickname);
	}

	/** * [이메일 중복 확인]
	 * - 가입 시 이메일 중복 여부를 판단함 (DB 유니크 제약 조건 대응).
	 */
	@Transactional(readOnly = true)
	public boolean isEmailDuplicated(String email) {
		return userRepository.existsByEmail(email);
	}

	/**
	 * [이메일 인증 완료 여부 검증]
	 * 	 * - 회원가입, 아이디 찾기 등 이메일 인증이 필수인 로직에서 공통으로 사용함.
	 * @param email 인증받을 이메일 값
	 */
	private void validateEmailVerification(String email) {
		// Redis에 "verified:이메일" 키가 있는지 확인("10분짜리 인증 증표 갖고 오셨나요?" 라고 확인함)
		Boolean isVerified = redisTemplate.hasKey("verified:" + email);
		if (!isVerified) {
			throw new IllegalArgumentException("이메일 인증이 완료되지 않았거나 세션이 만료되었습니다.");
		}
	}

	/**
	 * * [회원가입 처리]
	 * 	 * 1. 3중 검증: 아이디, 닉네임, 이메일의 중복 여부를 순차적으로 확인함.
	 * 	 * 2. 암호화: BCrypt를 이용하여 비밀번호를 해시화하여 저장함.
	 * 	 * 3. 저장: 가입 일시를 포함해 DB에 영구 기록함.
	 * @param request 회원가입 하고자 하는 사용자 정보
	 */
	@Transactional
	public void signUp(UserSignUpRequest request) {
		// 이메일 인증 여부 확인 (6자리 수 인증하였는지 체크)
		validateEmailVerification(request.getEmail());
		// 중복 검증 로직을 내부 메서드로 호출하여 핵심 흐름만 남김
		validateDuplicateData(request);
		//회원가입 성공으로 DB 저장
		UserEntity newUser = UserEntity.builder()
				.userId(request.getUserId())
				.name(request.getName())
				.password(passwordEncoder.encode(request.getPassword()))
				.email(request.getEmail())
				.nickname(request.getNickname())
				.createdAt(LocalDateTime.now())
				.build();
		userRepository.save(newUser);
	}

	/**
	 * * [회원가입 데이터 중복 검증 로직]
	 * 	 * - 가입 절차 중 발생할 수 있는 데이터 충돌을 한곳에서 관리함.
	 * @param request 사용자가 입력한 값을 통해 이미 존재하는지 여부를 비교한다.
	 */
	private void validateDuplicateData(UserSignUpRequest request) {
		if (isUserIdDuplicated(request.getUserId())) {
			throw new IllegalArgumentException("이미 사용 중인 아이디임.");
		}
		if (isNicknameDuplicated(request.getNickname())) {
			throw new IllegalArgumentException("이미 사용 중인 닉네임임.");
		}
		if (isEmailDuplicated(request.getEmail())) {
			throw new IllegalArgumentException("이미 가입된 이메일임.");
		}
	}

	/**
	 *  * [로그인 및 JWT 발급]
	 * 	 * 1. 식별: ID로 유저 검색. 없으면 에러 던짐.
	 * 	 * 2. 검증: 암호화된 비번 대조. 틀리면 에러 던짐.
	 * 	 * 3. 발급: 검증 완료 시 JWT 토큰 생성 및 반환함.
	 * @param request	로그인하고자 입력한 값
	 * @return			검증 상태에 따라 토큰 발급
	 */
	@Transactional(readOnly = true)
	public String login(UserLoginRequest request) {
		// 아이디 확인
		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디임."));

		// 비밀번호 확인
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new IllegalArgumentException("비밀번호 불일치함.");
		}

		// JWT 토큰 발급 (클라이언트는 이를 Authorization 헤더에 담아 제출함)
		return jwtProvider.createToken(user.getUserId());
	}

	/**
	 * [아이디 찾기: findUserId]
	 * @param email 가입 시 사용한 이메일
	 * @return 마스킹 처리된 유저 아이디 (String)
	 */
	@Transactional(readOnly = true)
	public String findUserId(String email) {
		// 이메일 인증 여부 먼저 확인
		validateEmailVerification(email);
		// 인증된 이메일로 유저 정보 조회
		return userRepository.findByEmail(email)
				/* * [로직 단계]
				 * 1. Unique/NotNull 제약조건 덕분에 결과는 0개 아니면 1개임.
				 * 2. 검색 성공 시, 유저 객체에서 아이디만 추출해 마스킹 메서드로 전달함.
				 * 3. 검색 실패 시(Empty), 가입 정보가 없다는 예외를 던짐.
				 */
				.map(user -> maskUserId(user.getUserId()))
				.orElseThrow(() -> new IllegalArgumentException("가입 정보가 없는 이메일임."));
	}

	/**
	 * [아이디 마스킹: maskUserId]
	 * @param userId 원본 아이디
	 * @return 일부 별표(*) 처리된 아이디
	 */
	private String maskUserId(String userId) {
		/*
		 * [마스킹 규칙]
		 * - 3자 이하: 첫 글자만 남기고 뒤에는 "**" 붙임.
		 * - 4자 이상: 앞의 5자(최대)만 보여주고 나머지는 원래 길이만큼 "*" 채움.
		 */
		if (userId.length() <= 3) {
			return userId.substring(0, 1) + "**";
		}
		int visibleLength = Math.min(userId.length(), 5);
		String visiblePart = userId.substring(0, visibleLength);
		int maskCount = userId.length() - visibleLength;
		return visiblePart + "*".repeat(maskCount);
	}

	/**
	 * [이메일 인증번호 발송]
	 * @param email 가입하려는 이메일이 이전에 가입한 이메일인지 여부 체크
	 */
	@Transactional
	public void sendVerificationCode(String email) {
		log.info("[Email Auth] 인증번호 발송 요청 시작 - Email: {}", email);

		// 하루 발송 횟수 제한 체크 (오늘 00:00:00 이후 데이터 카운트)
		LocalDateTime startOfToday = LocalDateTime.now().with(LocalTime.MIN);
		long requestCount = verificationRepository.countByEmailAndCreatedAtAfter(email, startOfToday);

		if (requestCount >= 5) {
			log.warn("[Email Auth] 발송 거부: 일일 제한 초과(5회) - Email: {}", email);
			throw new IllegalArgumentException("오늘 가능한 인증 횟수(5회)를 초과했습니다. 내일 다시 시도해주세요.");
		}

		// 1분 재요청 방지 (도배 방지)
		// Redis의 TTL(남은 시간)로 체크하도록 로직 변경
		// [실제 저장될 때의 모습 예시]
		// redisTemplate.opsForValue().set(AUTH_CODE_PREFIX + "test1234@gmail.com", "123456");
		// -> Redis 키: "auth_code:teset1234@gmail.com"
		Long expireTime = redisTemplate.getExpire(RedisKeys.AUTH_CODE + email, TimeUnit.SECONDS); //상수로 빼 둔 용도(인증코드 발급, auth_code:이메일로 저장.)
		if (expireTime != null && expireTime > 120) { // 3분(180초) 중 1분도 안 지났다면
			throw new IllegalArgumentException("이미 인증 메일을 발송했습니다. (60초 제한)");
		}

		// 난수 생성: 0으로 시작하는 번호를 위해 String 포맷팅 적용
		String authCode = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));

		// Redis에 인증번호 저장 (3분 후 자동 삭제)
		/* 곧장 redis 실행 테스트를 하고 싶으면, 우선 로컬단에 redis 설치 후,
			터미널에서 redis-cli 후, keys * 를 쳐보시면
			auth_code:이메일 이라는 키가 생겼다가 3분 뒤 사라지는걸 확인 가능합니다.
		*/
		redisTemplate.opsForValue().set(
				RedisKeys.AUTH_CODE + email,
				authCode,
				Duration.ofMinutes(3)
		);

		// DB 에는 이력만 저장 (보안을 위해 코드는 마스킹 처리로 수정)
		EmailVerificationEntity verification = EmailVerificationEntity.builder()
			  .email(email)
			  .authCode("******") // Redis에 실제 값이 있으므로 MySQL엔 마스킹
			  .createdAt(LocalDateTime.now()) // countBy에 필수
			  .build();
		verificationRepository.save(verification);

		// 실제 메일 발송 호출 (비동기)
		mailService.sendVerificationEmail(email, authCode); //양식에 맞춰서 발송
		log.info("[Email Auth] 메일 발송 서비스(Async) 호출 완료 - To: {}", email);
	}

	/**
	 *  [이메일 인증번호 검증]
	 * @param email 인증받고자 하는 이메일
	 * @param code	인증 코드
	 */
	@Transactional
	public void verifyCode(String email, String code) {
		// Redis 에서 번호 가져오기
		String savedCode = redisTemplate.opsForValue().get(RedisKeys.AUTH_CODE + email);
		if (savedCode == null) throw new IllegalArgumentException("인증 시간이 만료되었거나 기록이 없습니다.");
		if (!savedCode.equals(code)) throw new IllegalArgumentException("인증번호가 일치하지 않습니다.");

		// 성공 시 Redis 데이터 즉시 삭제 (1회성)
		redisTemplate.delete(RedisKeys.AUTH_CODE + email);

		// 가입 시 확인을 위한 '인증 성공 증표'를 Redis에 10분간 보관
		redisTemplate.opsForValue().set(RedisKeys.VERIFIED_EMAIL + email, "true", Duration.ofMinutes(10));
		log.info("[Email Auth] 인증 성공 - Email: {}", email);
	}

}