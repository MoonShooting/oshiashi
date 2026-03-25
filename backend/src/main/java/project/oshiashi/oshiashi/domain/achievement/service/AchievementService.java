package project.oshiashi.oshiashi.domain.achievement.service;

import project.oshiashi.oshiashi.domain.achievement.dto.AchievementResponse;
import java.util.List;

public interface AchievementService {

	/**
	 * [유저용] 내 획득 업적 목록 조회
	 * - 내부에서 시큐리티 컨텍스트를 사용하므로 userId 파라미터가 필요 없습니다.
	 */
	List<AchievementResponse> getAchievements();

	/**
	 * [시스템용] 특정 유저에게 업적 수여
	 * - 이벤트 리스너 등에서 특정 대상을 지정해야 하므로 userId를 유지합니다.
	 */
	void grantAchievement(String userId, String name, String description, String iconUrl);
}