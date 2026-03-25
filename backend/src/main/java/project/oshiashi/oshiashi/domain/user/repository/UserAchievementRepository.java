package project.oshiashi.oshiashi.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementId;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;

import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievementEntity, UserAchievementId> {

	/**
	 * [사용자별 모든 업적 조회]
	 */
	List<UserAchievementEntity> findAllByUser(UserEntity user);

	/**
	 * [최신순 업적 조회]
	 * - Collection<Object> 대신 명확한 엔티티 타입(List<UserAchievementEntity>)을 반환하도록 수정했습니다.
	 * - 명명 규칙: findAll + ByUser(조건) + OrderBy + AchievedAt(정렬필드) + Desc(내림차순)
	 */
	List<UserAchievementEntity> findAllByUserOrderByAchievedAtDesc(UserEntity user);

	/**
	 * [중복 지급 확인용 존재 여부 체크]
	 * - @Query 없이 객체 자체를 넘기는 방식이 가장 안전하고 에러가 없습니다.
	 * - 명명 규칙: exists + ByUser(엔티티) + And + Achievement(엔티티)
	 */
	boolean existsByUserAndAchievement(UserEntity user, AchievementEntity achievement);
}