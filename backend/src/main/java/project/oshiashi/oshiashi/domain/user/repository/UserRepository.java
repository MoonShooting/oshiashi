package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
	
	// 닉네임으로 사용자 존재 여부 확인 (중복 체크 포함?)
	// 아이디로 사용자 찾기 ?
	
}
