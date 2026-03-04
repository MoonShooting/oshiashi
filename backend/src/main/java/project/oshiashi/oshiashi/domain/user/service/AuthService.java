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
 * - 설계서 경로: /api/v1/auth/** 관련 비즈니스 로직 처리.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider; // [추가] 토큰 발급을 위한 엔진

	/**
	 * [아이디 중복 확인]
	 * - 가입 폼 입력 시 실시간 중복 체크를 위해 사용됨.
	 */
	@Transactional(readOnly = true)
	public boolean isUserIdDuplicated(String userId) {
		return userRepository.existsById(userId);
	}

	/**
	 * [닉네임 중복 확인]
	 * - 서비스 내 유일한 닉네임을 보장하기 위해 사용됨.
	 */
	@Transactional(readOnly = true)
	public boolean isNicknameDuplicated(String nickname) {
		return userRepository.existsByNickname(nickname);
	}

	/**
	 * [회원가입 처리]
	 * 1. 2중 체크: 프론트엔드 체크와 별개로 서버에서 다시 한번 중복 여부를 검증함 (보안 필수).
	 * 2. 암호화: BCrypt를 이용하여 비밀번호를 해시화함. 서버 개발자도 실제 비번을 알 수 없음.
	 * 3. 저장: 가입일(createdAt)을 포함하여 DB에 영구 저장함.
	 */
	@Transactional
	public void signUp(UserSignUpRequest request) {
		if (isUserIdDuplicated(request.getUserId())) {
			throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
		}
		if (isNicknameDuplicated(request.getNickname())) {
			throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
		}

		UserEntity newUser = UserEntity.builder()
				.userId(request.getUserId())
				.password(passwordEncoder.encode(request.getPassword())) // 비밀번호 암호화
				.email(request.getEmail())
				.nickname(request.getNickname())
				.createdAt(LocalDateTime.now()) // 가입 시점 기록
				.build();
		userRepository.save(newUser);
	}
	/**
	 * [로그인 및 JWT 발급]
	 * 1. 식별: ID로 유저 검색. 없으면 에러 던짐.
	 * 2. 검증: 암호화된 비번 대조. 틀리면 에러 던짐.
	 * 3. 발급: 검증 완료 시 JWT 토큰 생성 및 반환함.
	 */
	@Transactional(readOnly = true)
	public String login(UserLoginRequest request) {
		// 1. [아이디 확인] DB에서 ID로 유저 검색.
		// 유저 없으면 즉시 예외 던져서 이후 로직 차단함.
		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디임."));
		// 2. [비밀번호 확인] 입력 비번과 DB의 암호화 비번 대조.
		// BCrypt 특성상 matches() 활용한 내부 로직 비교 필수임.
		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new IllegalArgumentException("비밀번호 불일치함.");
		}
		// 3. [토큰 발급] 모든 검증 통과 시 JWT 토큰 생성.
		//  헤더에 이 토큰을 실어 서버에 인증된 사용자임을 알림
		return jwtProvider.createToken(user.getUserId());
	}
}