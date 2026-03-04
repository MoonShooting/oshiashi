package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.dto.UserLoginRequest;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.domain.user.dto.UserSignUpRequest;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	/**
	 * 아이디 중복 확인
	 * * [@Transactional(readOnly = true) 사용 이유]
	 * 데이터의 수정 없이 단순히 조회(SELECT)만 하는 메서드임을 명시합니다.
	 * JPA가 데이터 변경을 감지하기 위한 준비 작업(더티 체킹, 스냅샷 저장 등)을 생략하게 되어,
	 * 서버의 메모리를 절약하고 조회 처리 속도를 크게 높여줍니다.
	 */
	@Transactional(readOnly = true)
	public boolean checkUserIdDuplicate(String userId) {
		return userRepository.existsByUserId(userId);
	}

	/**
	 * 닉네임 중복 확인
	 * (아이디 중복 확인과 동일하게 읽기 전용 트랜잭션 적용)
	 */
	@Transactional(readOnly = true)
	public boolean checkNicknameDuplicate(String nickname) {
		return userRepository.existsByNickname(nickname);
	}

	/**
	 * 회원가입 처리 (DB 저장)
	 * * [@Transactional 사용 이유]
	 * 트랜잭션의 "모두 성공하거나, 아예 없었던 일로 하거나(All or Nothing)" 원칙을 적용합니다.
	 * 데이터를 DB에 저장(INSERT)하는 과정에서 예기치 못한 에러가 발생할 경우,
	 * 즉시 롤백(Rollback)시켜 데이터가 꼬이거나 불일치하는 현상을 완벽하게 방지하는 안전장치입니다.
	 */
	@Transactional
	public void signUp(UserSignUpRequest request) {
		// API 직접 호출에 대비한 서버단 2중 중복 체크
		if (checkUserIdDuplicate(request.getUserId())) {
			throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
		}

		// DTO -> Entity 변환
		// 필드가 많아도 가독성을 유지하고 순서 실수를 방지하기 위해 @Builder 패턴 사용
		UserEntity newUser = UserEntity.builder()
				.userId(request.getUserId())
				.email(request.getEmail())
				.password(request.getPassword()) // TODO: 현재 평문 저장 중. 추후 Spring Security(BCrypt) 암호화 적용 예정
				.nickname(request.getNickname())
				.createdAt(LocalDateTime.now())
				.build();

		// DB에 최종 저장 (성공 시 Commit, 실패 시 Rollback)
		userRepository.save(newUser);
	}
	/**
	 * 로그인 처리
	 * - 아이디 존재 여부 확인 후 비밀번호 대조함.
	 * - 성공 시 유저 엔티티를 반환하거나 성공 메시지를 보냄.
	 */
	@Transactional(readOnly = true)
	public UserEntity login(UserLoginRequest request) {
		// 1. 아이디로 유저 조회 (없으면 예외 발생)
		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));

		// 2. 비밀번호 일치 확인 (현재 평문 비교, 추후 암호화 적용 필수)
		if (!user.getPassword().equals(request.getPassword())) {
			throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
		}

		// 3. 로그인 성공 시 유저 객체 반환
		return user;
	}
}