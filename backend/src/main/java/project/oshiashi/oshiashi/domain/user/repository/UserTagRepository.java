package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserTagEntity;

@Repository
public interface UserTagRepository extends JpaRepository<UserTagEntity, Integer> {

	
}
