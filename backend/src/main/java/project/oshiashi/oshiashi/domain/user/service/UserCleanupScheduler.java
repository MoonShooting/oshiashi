package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * [UserCleanupScheduler: 탈퇴 유저 영구 삭제 스케줄러]
 * 스케쥴러 사용 이후
 * 1. 자동화 및 정확성 (Privacy Policy 준수):
 * - 개인정보 취급 방침상 "탈퇴 후 30일 뒤 파기"를 약속했으므로,
 * 개발자가 매일 수동으로 DB를 지울 수는 없습니다. 기계가 정확한 날짜에 알아서 처리해야 합니다.
 * 2. 데이터베이스 성능 최적화 (Off-peak Time 활용):
 * - 유저 한 명을 지우면 CASCADE로 인해 수십~수백 개의 게시글, 댓글, 루트가 연쇄 삭제(Hard Delete)됩니다.
 * - 이 무거운 작업을 사용자가 몰리는 낮 시간에 API 요청과 동시에 처리하면 DB에 락(Lock)이 걸려 서버가 멈출 수 있습니다.
 * - 따라서 사용자가 가장 적은 '새벽 시간'에 스케줄러를 돌려 일괄 처리하는 것이 서버 안정성에 필수적입니다.
 * 3. 비즈니스 로직 분리 (Decoupling):
 * - '탈퇴 요청 API'는 단순히 유저 상태만 가볍게 바꾸고(Soft Delete) 0.1초 만에 응답을 끝냅니다.
 * - 무겁고 오래 걸리는 '진짜 삭제' 작업은 스케줄러에게 위임함으로써 사용자 경험(UX)을 쾌적하게 유지합니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserCleanupScheduler {

	private final UserRepository userRepository;

	/**
	 * [스케줄러 실행 주기 설정: Cron 표현식]
	 * "0 0 3 * * *" = 매일 새벽 3시 0분 0초에 실행
	 * (사용자가 가장 적은 새벽 시간을 활용하여 DB 부하를 최소화)
	 */
	@Scheduled(cron = "0 0 3 * * *")
	@Transactional
	public void cleanupWithdrawnUsers() {
		log.info("[Scheduler] 탈퇴 유예 기간(30일) 만료 유저 정리 배치를 시작합니다.");

		// 1. 기준 시간 계산: 지금으로부터 정확히 30일 전 시간
		LocalDateTime thresholdDate = LocalDateTime.now().minusDays(30);

		// 2. 타겟 색출: 상태가 WITHDRAWN이고, 탈퇴일(deletedAt)이 30일 전보다 과거인 유저들 조회
		List<UserEntity> expiredUsers = userRepository.findByStatusAndDeletedAtBefore(
				UserEntity.UserStatus.withdrawn,
				thresholdDate
		);

		if (expiredUsers.isEmpty()) {
			log.info("[Scheduler] 오늘 삭제할 만료 유저가 없습니다.");
			return;
		}

		// 3. 영구 삭제 실행 (Hard Delete)
		// JPA가 이 유저들을 지울 때, DB의 CASCADE 제약조건에 의해 연관된 데이터도 모두 자동 폭파됩니다.
		int deletedCount = expiredUsers.size();
		userRepository.deleteAll(expiredUsers);

		log.info("[Scheduler] 영구 삭제 완료 - 총 {}명의 유저 및 연관 데이터가 파기되었습니다.", deletedCount);
	}
}