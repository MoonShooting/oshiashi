package project.oshiashi.oshiashi.domain.achievement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.achievement.dto.AchievementResponse;
import project.oshiashi.oshiashi.domain.achievement.entity.AchievementEntity;
import project.oshiashi.oshiashi.domain.achievement.repository.AchievementRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserAchievementRepository;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;
import project.oshiashi.oshiashi.security.AuthenticatedUser;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AchievementServiceImpl implements AchievementService {

	private final AchievementRepository achievementRepository;
	private final UserAchievementRepository userAchievementRepository;
	private final UserRepository userRepository;

	// 업적 아이콘이 없을 경우(null) 시스템에서 공통으로 사용할 기본 이미지 경로
	private static final String DEFAULT_ICON = "/uploads/achievements/oshiashi-default.png";

	/**
	 * [내 업적 목록 조회]
	 * - 기존 시큐리티 인프라(AuthenticatedUser)를 직접 활용하여 로그인한 사용자를 식별
	 */
	@Override
	@Transactional(readOnly = true)
	public List<AchievementResponse> getAchievements() {
		// 1. SecurityContextHolder에서 현재 인증 정보를 가져옴
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();

		// 2. JwtAuthenticationFilter가 저장한 'AuthenticatedUser' 레코드로 형변환
		AuthenticatedUser authenticatedUser = (AuthenticatedUser) auth.getPrincipal();

		// 3. 레코드의 user() 메서드를 통해 유저의 고유 ID(userId)를 확보
		String currentUserId = authenticatedUser.user().getUserId();

		// [변경] 유저 못 찾는 예외는 프로젝트 공통 코드인 RESOURCE_NOT_FOUND를 사용
		UserEntity user = userRepository.findById(currentUserId)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));

		// 4. 명명 규칙으로 만든 리포지토리 메서드를 호출하여 목록을 반환
		return userAchievementRepository.findAllByUserOrderByAchievedAtDesc(user).stream()
				.map(AchievementResponse::from) // 변수명 userAchievement가 적용된 DTO 변환
				.collect(Collectors.toList());
	}

	/**
	 * [업적 수여 및 실시간 생성 로직]
	 * - 특정 조건이 충족되었을 때 호출되며, 업적 지급과 마스터 정보 관리를 동시에 수행
	 */
	@Override
	public void grantAchievement(String userId, String name, String description, String iconUrl) {
		UserEntity user = userRepository.findById(userId).orElse(null);
		if (user == null) {
			log.warn("[Achievement] 존재하지 않는 유저 ID: {}", userId);
			return;
		}

		// [아이콘 방어 로직] 전달받은 iconUrl이 null이면 오시아시 전용 기본 아이콘으로 설정
		String finalIconUrl = (iconUrl != null) ? iconUrl : DEFAULT_ICON;

		// 1. [동적 마스터 생성] 해당 이름의 업적이 마스터 DB에 없으면 즉시 생성
		// 이를 통해 새로운 태그나 작품이 추가될 때마다 관리자가 미리 업적을 등록할 필요가 없음
		AchievementEntity achievement = achievementRepository.findByName(name)
				.orElseGet(() -> achievementRepository.save(
						AchievementEntity.builder()
								.name(name)
								.description(description)
								.iconUrl(finalIconUrl)
								.build()
				));

		// 2. [중복 지급 방어] 객체 기반의 명명 규칙 메서드를 활용해 이미 해당 업적을 가졌는지 확인
		if (!userAchievementRepository.existsByUserAndAchievement(user, achievement)) {

			// 3. [신규 획득 저장] 유저와 업적을 연결하여 획득 내역(user_achievement)에 저장
			userAchievementRepository.save(UserAchievementEntity.builder()
					.user(user)
					.achievement(achievement)
					.build());
			log.info("[업적 달성] 유저: {} 님이 새 업적 [{}]을(를) 획득했습니다!", user.getNickname(), name);
		}
	}
}