package project.oshiashi.oshiashi.domain.achievement.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * [AchievementController: 업적 관련 도메인 컨트롤러]
 * * 현재 이 컨트롤러가 비어있는 이유:
 * * 1. 조회 API의 이동:
 * - '내 칭호 목록 조회'는 유저 프로필의 일부로 간주하여 UserController(/api/v1/user/achievement)로 통합되었습니다.
 * * 2. 획득(지급) API의 부재:
 * - 업적 수여(grantAchievement)는 보안상 유저가 직접 호출하는 API로 노출하지 않습니다.
 * - 게시글 작성, 댓글 작성 등 특정 조건 만족 시 '서버 내부(Service/Event)'에서 자동으로 처리됩니다.
 * * 3. 확장성 대비:
 * - 향후 '전체 업적 도감 조회'나 '업적 상세 정보' 등 유저 개인 정보가 아닌
 * 공통 업적 데이터에 대한 API가 필요해질 경우 이곳에 구현합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/achievements")
@RequiredArgsConstructor
public class AchievementController {
	// 현재는 모든 업적 관련 인터페이스가 UserController 및 Service 내부 로직으로 분산되어 비어 있습니다.
}