package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {

	/** * [닉네임 중복 확인]
	 * - 회원가입 시 입력된 닉네임이 이미 존재하는지 여부를 판단함.
	 * - 존재하면 true, 없으면 false를 반환함.
	 */
	boolean existsByNickname(String nickname);

	/** * [이메일 중복 확인]
	 * - 회원가입 시 입력된 이메일이 사용 중인지 판단함.
	 * - 데이터 무결성을 위해 서비스 레이어에서 활용함.
	 */
	boolean existsByEmail(String email);

	/**
	 * [Optional 반환과 DB 제약 조건의 상관관계]
	 * 1. unique = true 영향:
	 * - 이메일은 유일하므로 결과가 0개 혹은 1개임이 보장됨.
	 * - 덕분에 List가 아닌 '단일 객체를 감싼 Optional'을 안전하게 반환할 수 있음!
	 * * 2. nullable = false 영향:
	 * - 검색 성공 시, 꺼내온 UserEntity 안의 email 필드가 null일 걱정이 없음.
	 * - 데이터 정결성이 보장되므로 후속 로직에서 추가적인 null 체크가 불필요함.
	 */
	// 이메일로 사용자 정보 찾기 (아이디 찾기용)
	Optional<UserEntity> findByEmail(String email);

	// 아이디와 이메일이 동시에 일치하는지 확인 (비밀번호 재설정 전 본인확인용)
	Optional<UserEntity> findByUserIdAndEmail(String userId, String email);

	/**
	 * [탈퇴 유예 기간 만료 유저 조회]
	 * - 특정 상태(WITHDRAWN)이면서,
	 * - 탈퇴 요청일(deletedAt)이 기준 시간(30일 전)보다 과거인 유저 목록을 반환합니다.
	 */
	List<UserEntity> findByStatusAndDeletedAtBefore(UserEntity.UserStatus status, LocalDateTime dateTime);
}