package project.oshiashi.oshiashi.domain.achievement.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;

import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<AchievementEntity, Long> {
	Optional<AchievementEntity> findByName(String name);

	boolean existsByName(String name);
}