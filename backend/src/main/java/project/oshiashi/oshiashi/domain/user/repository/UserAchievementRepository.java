package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementId;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievementEntity, UserAchievementId> {
	
}
