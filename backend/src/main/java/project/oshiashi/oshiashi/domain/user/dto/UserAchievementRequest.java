package project.oshiashi.oshiashi.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * [UserAchievementRequest: 유저 칭호 관련 요청 DTO]
 * - 용도: 대표 칭호 설정 등 칭호와 관련된 요청을 보낼 때 사용
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserAchievementRequest {

	// 칭호 마스터 테이블의 PK (DB의 selected_achievement_id로 매핑될 값)
	private Long achievementId;

}