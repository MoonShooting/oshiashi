package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.security.JwtProvider;
import java.time.LocalDateTime;

/**
 * [AuthService: 인증 관문 서비스]
 * - 역할: 회원가입 시의 자격 부여, 로그인 시의 자격 검증 및 JWT 발급을 전담함.
 * - 설계서 경로: /api/v1/auth/** 관련 비즈니스 로직 처리함.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;

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

	/** * [회원가입 처리]
	 * 1. 3중 검증: 아이디, 닉네임, 이메일의 중복 여부를 순차적으로 확인함.
	 * 2. 암호화: BCrypt를 이용하여 비밀번호를 해시화하여 저장함.
	 * 3. 저장: 가입 일시를 포함해 DB에 영구 기록함.
	 */
	@Transactional
	public void signUp(UserSignUpRequest request) {
		// 중복 검증 로직을 내부 메서드로 호출하여 핵심 흐름만 남김
		validateDuplicateData(request);

		UserEntity newUser = UserEntity.builder()
				.userId(request.getUserId())
				.password(passwordEncoder.encode(request.getPassword()))
				.email(request.getEmail())
				.nickname(request.getNickname())
				.createdAt(LocalDateTime.now())
				.build();

		userRepository.save(newUser);
	}

	/** * [회원가입 데이터 중복 검증 로직]
	 * - 가입 절차 중 발생할 수 있는 데이터 충돌을 한곳에서 관리함.
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

	/** * [로그인 및 JWT 발급]
	 * 1. 식별: ID로 유저 검색. 없으면 에러 던짐.
	 * 2. 검증: 암호화된 비번 대조. 틀리면 에러 던짐.
	 * 3. 발급: 검증 완료 시 JWT 토큰 생성 및 반환함.
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
}