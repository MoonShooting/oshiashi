package project.oshiashi.oshiashi.domain.achievement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;

@Repository
public interface AchievementRepository extends JpaRepository<AchievementEntity, Long> {
}
