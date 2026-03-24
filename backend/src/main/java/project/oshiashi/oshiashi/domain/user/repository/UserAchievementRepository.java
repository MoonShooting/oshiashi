package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementId;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;
import java.util.Optional;

public interface UserAchievementRepository extends JpaRepository<UserAchievementEntity, UserAchievementId> {

	List<UserAchievementEntity> findAllByUser(UserEntity me);

	// 💡 이 메서드가 없어서 에러가 났던 거예요! 이걸 추가해 주세요.
	Optional<UserAchievementEntity> findByUser_UserIdAndAchievement_AchievementId(String userId, Long achievementId);
}