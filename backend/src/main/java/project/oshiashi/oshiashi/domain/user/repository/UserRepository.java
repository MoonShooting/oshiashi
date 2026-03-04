package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

/**
 * @Repository
 * - DB 접근 계층(Persistence Layer)임을 선언함.
 * - 스프링 데이터 JPA가 인터페이스의 구현체를 자동으로 생성하여 주입함.
 */
@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {

	/**
	 * existsByUserId
	 * - 아이디 중복 확인을 위한 쿼리 메서드임.
	 * - DB에 해당 userId가 존재하면 true, 없으면 false를 반환함.
	 */
	boolean existsByUserId(String userId);

	/**
	 * existsByNickname
	 * - 닉네임 중복 확인을 위한 쿼리 메서드임.
	 * - 가입 시 닉네임 중복 여부를 체크할 때 사용함.
	 */
	boolean existsByNickname(String nickname);

}