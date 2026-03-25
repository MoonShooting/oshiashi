package project.oshiashi.oshiashi.domain.achievement.aop;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import project.oshiashi.oshiashi.domain.achievement.repository.AchievementRepository;
import project.oshiashi.oshiashi.domain.achievement.service.AchievementService;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostTagRepository;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;

/**
 * [AchievementAspect: 업적 시스템의 핵심 엔진]
 * * 1. 존재 이유 (Why):
 * - 게시글 작성(PostService) 로직과 업적 부여 로직을 분리하기 위함입니다(AOP).
 * - 서비스 로직을 수정하지 않고도 '작품별 최초 발견자', '누적 탐방가' 등의 게임 요소를 추가할 수 있습니다.
 * * 2. PostTag를 사용하는 이유 (Why PostTag):
 * - 설계서 16번 테이블(post_tag)은 게시글과 작품(Artwork)을 잇는 가장 확실한 지표입니다.
 * - 유저가 선택한 '태그'를 통해 어떤 작품의 업적을 계산할지 결정하므로 데이터의 의도가 명확합니다.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AchievementAspect {

	private final AchievementService achievementService;
	private final AchievementRepository achievementRepository;
	private final PostTagRepository postTagRepository; // 이제 포스트 태그 리포지토리를 사용합니다.

	@AfterReturning(
			pointcut = "execution(* project.oshiashi.oshiashi.domain.post.service.PostServiceImpl.createPost(..))",
			returning = "result"
	)
	public void afterPostCreated(Object result) {
		if (result instanceof PostEntity post) {

			// [데이터 추출] 게시글에 달린 첫 번째 태그를 통해 작품 정보를 가져옵니다.
			if (post.getPostTags() == null || post.getPostTags().isEmpty()) return;

			ArtworkEntity artwork = post.getPostTags().get(0).getTag().getArtwork();

			String artworkTitle = artwork.getTitle();  // 설계서 컬럼명: title
			String posterUrl = artwork.getPosterUrl(); // 설계서 컬럼명: poster_url
			String userId = post.getUser().getUserId();
			Long artworkId = artwork.getArtworkId();

			// [로직 1: 전 서버 최초 개척자 판단]
			// 설계서의 achievement 테이블에 해당 작품의 개척자 업적이 이미 있는지 확인합니다.
			String globalAchName = String.format("[%s] 최초의 개척자", artworkTitle);

			if (!achievementRepository.existsByName(globalAchName)) {
				// 아직 아무도 이 작품 태그로 글을 쓰지 않았다면 이 유저가 '최초 발견자'입니다.
				String achDesc = String.format("오시아시 전체에서 [%s] 성지 정보를 가장 처음으로 공유한 개척자!", artworkTitle);
				achievementService.grantAchievement(userId, globalAchName, achDesc, posterUrl);
				log.info("🏆 [NEW 개척자] 유저 {} 님이 [{}]의 문을 열었습니다.", userId, artworkTitle);
				return; // 개척자 업적 획득 시 하위 업적 계산은 생략합니다.
			}

			// [로직 2: 개인별 누적 업적 판단]
			// PostTagRepository를 사용하여 유저의 작품별 활동량을 계산합니다.
			long personalCount = postTagRepository.countByPost_User_UserIdAndTag_Artwork_ArtworkId(userId, artworkId);

			if (personalCount == 1) {
				// 이 작품 태그로는 처음 글을 쓴 경우
				String achName = String.format("[%s] 탐방 시작", artworkTitle);
				String achDesc = String.format("[%s] 성지 순례의 첫 발자국을 떼셨군요!", artworkTitle);
				achievementService.grantAchievement(userId, achName, achDesc, posterUrl);
			}
			else if (personalCount == 10) {
				// 특정 작품에 대한 충성도가 높은 경우
				String achName = String.format("[%s] 명예 시민", artworkTitle);
				String achDesc = String.format("[%s] 성지를 10번이나 방문한 진정한 팬 인증!", artworkTitle);
				achievementService.grantAchievement(userId, achName, achDesc, posterUrl);
			}
		}
	}
}