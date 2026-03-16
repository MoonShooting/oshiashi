package project.oshiashi.oshiashi.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.user.dto.UserResponse;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
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
	 */
	@Transactional(readOnly = true)
	public Object getUserProfile() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 프로필 요약 조회 함: {}", me.getUserId());
		// TODO: 프로필 전용 DTO를 만들어 반환 (닉네임, 작성글 수 등 포함)
		return null;
	}

	/**
	 * [개인정보 수정]
	 * - API: /api/v1/user/update
	 * - 용도: 닉네임 등 변경 가능한 정보를 업데이트
	 */
	@Transactional
	public void updateProfile(String newNickname) {
		UserEntity me = getCurrentUserEntity();

		if (userRepository.existsByNickname(newNickname)) {
			throw new IllegalArgumentException("이미 존재하는 닉네임입니다.");
		}

		me.changeNickname(newNickname);
		log.info("[UserService] 프로필 수정 완료: {}", me.getUserId());
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
	@Transactional(readOnly = true)
	public List<?> getMyRoutes() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 내 루트 목록 조회: {}", me.getUserId());
		// return routeRepository.findAllByUser(me);
		return null;
	}

	/**
	 * [내가 쓴 글 목록 조회]
	 * - API: /api/v1/user/posts
	 * - 용도: 사용자가 작성한 커뮤니티 게시글 목록을 호출
	 */
	@Transactional(readOnly = true)
	public List<?> getMyPosts() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 내가 쓴 글 조회: {}", me.getUserId());
		return me.getPosts(); // UserEntity의 @OneToMany 관계 활용
	}

	/**
	 * [내가 쓴 댓글 목록 조회]
	 * - API: /api/v1/user/comments
	 * - 용도: 사용자가 여러 게시글에 남긴 댓글 이력을 확인
	 */
	@Transactional(readOnly = true)
	public List<?> getMyComments() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 내가 쓴 댓글 조회: {}", me.getUserId());
		// return commentRepository.findAllByUser(me);
		return null;
	}

	/**
	 * [북마크 목록 조회]
	 * - API: /api/v1/user/bookmarks
	 * - 용도: 사용자가 즐겨찾기(북마크)한 게시글이나 장소 목록을 호출
	 */
	@Transactional(readOnly = true)
	public List<?> getMyBookmarks() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 북마크 조회: {}", me.getUserId());
		// return bookmarkRepository.findAllByUser(me);
		return null;
	}

	/**
	 * [보유 칭호 목록 조회]
	 * - API: /api/v1/user/achievement
	 * - 용도: 사용자가 활동을 통해 획득한 모든 칭호 목록을 조회
	 */
	@Transactional(readOnly = true)
	public List<?> getMyAchievements() {
		UserEntity me = getCurrentUserEntity();
		log.info("[UserService] 칭호 목록 조회: {}", me.getUserId());
		return null;
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
	}

	/**
	 * [공통 유틸리티: 현재 로그인한 유저 엔티티 인출]
	 * - SecurityContext에서 인증 정보를 꺼내 DB의 최신 유저 상태를 반환
	 */
	private UserEntity getCurrentUserEntity() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
			throw new IllegalStateException("인증된 사용자 정보를 찾을 수 없습니다.");
		}

		return userRepository.findById(authenticatedUser.user().getUserId())
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
	}
}