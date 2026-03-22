package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.bookmark.dto.BookmarkResponse;
import project.oshiashi.oshiashi.domain.bookmark.entity.BookmarkEntity;
import project.oshiashi.oshiashi.domain.bookmark.repository.BookmarkRepository;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;
import project.oshiashi.oshiashi.domain.comment.repository.CommentRepository;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.route.dto.RouteResponse;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.user.dto.UserAchievementResponse;
import project.oshiashi.oshiashi.domain.user.dto.UserProfileResponse;
import project.oshiashi.oshiashi.domain.user.dto.UserResponse;
import project.oshiashi.oshiashi.domain.user.entity.UserAchievementEntity;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserAchievementRepository;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;
import project.oshiashi.oshiashi.security.AuthenticatedUser;
import java.util.List;

/**
 * [UserService: 마이페이지 관리 서비스]
 * - 명세서 경로: /api/v1/user/**
 * - 역할: 인증된 사용자의 프로필 관리 및 활동 데이터(루트, 게시글, 북마크, 칭호) 연동을 담당함.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

	private final UserRepository userRepository;
	private final RouteRepository routeRepository;
	private final PostRepository postRepository;
	private final CommentRepository commentRepository;
	private final BookmarkRepository bookmarkRepository;
	private final UserAchievementRepository userAchievementRepository;

	/**
	 * [현재 유저 정보 상세 조회]
	 * - API: /api/v1/user/me
	 * - 용도: 마이페이지 진입 시 사용자의 기본 계정 정보를 반환
	 */
	@Transactional(readOnly = true)
	public UserResponse getMyInfo() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 상세 정보 조회: {}", me.getUserId());
		return UserResponse.fromEntity(me);
	}

	/**
	 * [회원 프로필 요약 조회]
	 * - API: /api/v1/user/profile
	 * - 용도: 닉네임, 대표 칭호 등 타인에게도 보여줄 수 있는 프로필 요약을 조회
	 *
	 *  */
	@Transactional(readOnly = true)
	public UserProfileResponse getUserProfile() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 프로필 요약 조회 함: {}", me.getUserId());
		// TODO: 프로필 전용 DTO를 만들어 반환 (닉네임, 작성글 수 등 포함), 프론트랑 조금 더 논의 후 유저프로필 리스폰스 제작
		int routeCount = routeRepository.findAllByUser(me).size();
		int postCount = postRepository.findAllByUserOrderByCreatedAtDesc(me).size();
		int bookmarkCount = bookmarkRepository.findAllByUser(me).size();
		int achievementCount = userAchievementRepository.findAllByUser(me).size();

		// 대표 칭호 조회
		// 현재 프로젝트에 대표 칭호 필드/메서드가 다를 수 있으니 그에 맞게 조정 필요
		/*
		String mainAchievement = userAchievementRepository.findAllByUser(me).stream()
				.filter(userAchievement -> Boolean.TRUE.equals(userAchievement.getIsMain()))
				.map(userAchievement -> userAchievement.getAchievement().getName())
				.findFirst()
				.orElse("대표 칭호 없음");*/

		return UserProfileResponse.builder()
				.nickname(
						me.getNickname() != null && !me.getNickname().isBlank()
								? me.getNickname()
								: "닉네임 없음"
				)
				.email(me.getEmail())
				.joinedAt(
						me.getCreatedAt() != null
								? me.getCreatedAt().toLocalDate().toString()
								: "-"
				)
				// .mainAchievement(mainAchievement)
				.routeCount(routeCount)
				.postCount(postCount)
				.bookmarkCount(bookmarkCount)
				.achievementCount(achievementCount)
				.build();
	}

	/**
	 * [내 루트 목록 조회]
	 * - API: /api/v1/user/myRoute
	 * - 용도: 사용자가 생성한 여행 루트 목록 호출
	 * [제네릭(Generics) '?' 설명]
	 * - '?'는 와일드카드로 "어떤 타입이든 올 수 있음"을 뜻하는 제네릭 문법
	 *  - 현재 루트 관련 DTO가 미정이라, 나중에 특정 타입(예: List<RouteResponse>)으로 
	 *  교체하기 전까지 모든 리스트 형식을 수용하기 위해 임시로 비워둔 예약자리
	 */
	@Transactional(readOnly = true) // 읽기 전용 트랜잭션: 데이터 수정이 없으므로 성능 최적화 및 안정성 확보
	public List<RouteResponse> getMyRoutes() {
		// 1. 시큐리티 컨텍스트 등에서 현재 로그인한 유저의 엔티티 정보를 획득
		UserEntity me = getCurrentUserEntity();
		// 2. 로그 기록: 어떤 사용자가 루트 목록을 조회하는지 서버 로그에 남김
		log.info("[UserService] 내 루트 목록 조회: {}", me.getUserId());
		// 3. 리포지토리를 호출하여 해당 유저(me)가 작성한 모든 Route 엔티티를 DB에서 가져옴
		List<RouteEntity> routes = routeRepository.findAllByUser(me);
		// 4. 스트림(Stream) API를 사용하여 엔티티 목록을 클라이언트에 전달할 전용 응답 객체(DTO)로 변환
		return routes.stream()
				.map(RouteResponse::fromEntity) // RouteEntity -> RouteResponse 변환 로직 실행
				.toList();                      // 최종 결과를 리스트로 변환하여 반환
	}
	/**
	 * [내가 쓴 글 목록 조회]
	 * - API: /api/v1/user/posts
	 * - 용도: 사용자가 작성한 커뮤니티 게시글 목록을 호출
	 */
	@Transactional(readOnly = true) // 읽기 전용 트랜잭션 모드 적용
	public List<PostResponse> getMyPosts() {
		// 1. 현재 로그인한 사용자 정보를 엔티티 객체로 가져옴
		UserEntity me = getCurrentUserEntity();
		// 2. 로그 기록: 작성글 조회 시점의 유저 ID 기록
		log.info("[UserService] 내가 쓴 글 조회: {}", me.getUserId());
		// 3. 비즈니스 로직: 리포지토리에서 해당 유저의 글을 '생성일시(CreatedAt) 내림차순(Desc)'으로 조회
		// (최신순 정렬 기능이 리포지토리 메서드명에 포함되어 있음)
		List<PostEntity> posts = postRepository.findAllByUserOrderByCreatedAtDesc(me);
		// 4. 결과 가공: 보안 및 필요한 데이터만 전달하기 위해 Entity를 PostResponse(DTO)로 변환
		return posts.stream()
				.map(PostResponse::fromEntity) // PostResponse 클래스의 정적 팩토리 메서드 활용
				.toList();                      // 변환된 DTO 리스트를 최종 반환
	}

	/**
	 * [내가 쓴 댓글 목록 조회]
	 * - API: /api/v1/user/comments
	 * - 용도: 사용자가 여러 게시글에 남긴 댓글 이력을 최신순으로 확인합니다.
	 */
	@Transactional(readOnly = true) // 데이터 정합성을 유지하며 읽기 전용으로 최적화된 트랜잭션 실행
	public List<CommentResponse> getMyComments() {
		// 1. 보안 컨텍스트에서 인증된 현재 사용자(나)의 정보를 가져옴
		UserEntity me = getCurrentUserEntity();
		// 2. 로그 기록: 어떤 사용자가 본인의 댓글 이력을 조회하는지 기록 (디버깅 및 모니터링 용도)
		log.info("[UserService] 내가 쓴 댓글 조회: {}", me.getUserId());
		// 3. 비즈니스 로직: 리포지토리를 통해 내가 작성한 댓글들을 생성일자 기준 내림차순(최신순)으로 조회
		List<CommentEntity> comments = commentRepository.findAllByUserOrderByCreatedAtDesc(me);
		// 4. 결과 변환: DB 엔티티(Entity)를 클라이언트 요구 규격에 맞는 응답 객체(DTO)로 매핑하여 반환
		return comments.stream()
				.map(CommentResponse::fromEntity) // 각 댓글 엔티티를 CommentResponse DTO로 변환
				.toList();                      // 최종 변환된 DTO들을 리스트에 담아 응답
	}

	/**
	 * [북마크 목록 조회]
	 * - API: /api/v1/user/bookmarks
	 * - 용도: 사용자가 즐겨찾기(북마크)한 게시글이나 장소 목록을 최신순으로 호출합니다.
	 */
	@Transactional(readOnly = true)
	public List<BookmarkResponse> getMyBookmarks() {
		// 1. 현재 시스템에 로그인되어 있는 유저 엔티티 정보를 획득
		UserEntity me = getCurrentUserEntity();
		// 2. 로그 기록: 북마크를 조회하는 유저의 ID를 로그에 남겨 추적 가능하게 함
		log.info("[UserService] 북마크 조회: {}", me.getUserId());
		// 3. 비즈니스 로직: 북마크 리포지토리를 통해 해당 유저가 저장한 북마크 리스트를 가져옴
		// (필요에 따라 OrderByCreatedAtDesc를 붙여 최신 등록 순으로 가져올 수 있습니다)
		List<BookmarkEntity> bookmarks = bookmarkRepository.findAllByUser(me);
		// 4. 결과 가공: 엔티티(Entity)를 순회하며 클라이언트 응답용 DTO(BookmarkResponse)로 변환
		return bookmarks.stream()
				.map(BookmarkResponse::fromEntity) // BookmarkResponse의 static 팩토리 메서드로 변환 실행
				.toList();                       // 변환된 DTO 리스트를 최종 반환
	}

	/**
	 * [보유 칭호 목록 조회]
	 * - API: /api/v1/user/achievements
	 * - 용도: 사용자가 활동을 통해 획득한 모든 칭호 내역을 최신순으로 호출합니다.
	 */
	@Transactional(readOnly = true) // 읽기 전용 트랜잭션으로 설정하여 조회 성능 최적화
	public List<UserAchievementResponse> getMyAchievements() {
		// 1. 현재 시스템에 로그인되어 있는 유저 엔티티 정보를 획득
		UserEntity me = getCurrentUserEntity();

		// 2. 로그 기록: 어떤 유저가 자신의 칭호 획득 내역을 조회하는지 로그에 남김
		log.info("[UserService] 칭호 목록 조회: {}", me.getUserId());

		// 3. 비즈니스 로직: 유저-칭호 연결 리포지토리를 통해 해당 유저의 모든 획득 내역을 가져옴
		// (필요 시 findAllByUserOrderByAchievedAtDesc 처럼 정렬된 메서드 사용 권장)
		List<UserAchievementEntity> userAchievements = userAchievementRepository.findAllByUser(me);

		// 4. 결과 가공: 중간 테이블 엔티티를 순회하며 클라이언트용 응답 DTO(UserAchievementResponse)로 변환
		return userAchievements.stream()
				.map(UserAchievementResponse::fromEntity) // 엔티티의 마스터 정보와 획득일시를 DTO로 매핑
				.toList();                               // 변환된 DTO 리스트를 최종 반환
	}

	/**
	 * [대표 칭호 변경]
	 * - API: /api/v1/user/mainAchievement
	 * - 용도: 보유한 칭호 중 프로필에 노출될 대표 칭호를 설정
	 */
	@Transactional
	public void updateMainAchievement(Long achievementId) {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 대표 칭호 변경 요청: {}", me.getUserId());
		// me.changeMainAchievement(achievementId);
		// TODO: 대표 칭호 저장 구조(main_achievement_id 또는 user_achievement.is_main)가 정해지면 보유 업적 검증 후 대표 칭호를 실제로 저장하도록 구현
		throw new UnsupportedOperationException("대표 칭호 설정 기능은 아직 구현되지 않았습니다.");
	}

	/**
	 * [공통 유틸리티: 현재 로그인한 유저 엔티티 인출]
	 * - SecurityContext에서 인증 정보를 꺼내 DB의 최신 유저 상태를 반환
	 */
	private UserEntity getCurrentUserEntity() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED, "인증된 사용자 정보를 찾을 수 없습니다.");
		}
		return userRepository.findById(authenticatedUser.user().getUserId())
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "사용자를 찾을 수 없습니다."));
	}

	/**
	 * 특정 유저의 요약된 프로필을 userId기반 조회 합니다.
	 * 보통은 친구 코드같은 형식으로 조회 하지만 지금은 ID밖에 없으니 이렇게 만들었어요
	 */
	@Transactional(readOnly = true)
	public UserProfileResponse getUserProfileByUserId(String userId) {
		UserEntity targetUser = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "사용자를 찾을 수 없습니다."));

		log.info("[UserService] 특정 유저 프로필 요약 조회 >> {}", targetUser.getUserId());

		int routeCount = routeRepository.findAllByUser(targetUser).size();
		int postCount = postRepository.findAllByUserOrderByCreatedAtDesc(targetUser).size();
		int bookmarkCount = bookmarkRepository.findAllByUser(targetUser).size();
		int achievementCount = userAchievementRepository.findAllByUser(targetUser).size();

		return UserProfileResponse.builder()
				.nickname(
						targetUser.getNickname() != null && !targetUser.getNickname().isBlank()
								? targetUser.getNickname()
								: "닉네임 없음"
				)
				// 공개 프로필이면 email은 숨기는 게 안전
				.email(null)
				.joinedAt(
						targetUser.getCreatedAt() != null
								? targetUser.getCreatedAt().toLocalDate().toString()
								: "-"
				)
				.routeCount(routeCount)
				.postCount(postCount)
				.bookmarkCount(bookmarkCount)
				.achievementCount(achievementCount)
				.build();
	}

}