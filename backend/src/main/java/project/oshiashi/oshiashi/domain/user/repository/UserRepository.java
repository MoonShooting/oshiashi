package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

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

	
}
