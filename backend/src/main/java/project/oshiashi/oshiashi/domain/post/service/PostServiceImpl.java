package project.oshiashi.oshiashi.domain.post.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.post.dto.PostRequest;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostImageEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostTagEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional // 서비스 레이어 전체에 트랜잭션 적용 (더티 체킹 및 데이터 일관성 보장)
public class PostServiceImpl implements PostService {

	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final RouteRepository routeRepository;
	private final TagRepository tagRepository;

	/**
	 * 1. 게시글 전체 조회 ( 루트가 있는 게시물)
	 * @return List<PostResponse>
	 * - 필수 반환: 모든 필드 (postId, title, content, status, viewCount, likeCount, tagNames, createdAt, updateAt)
	 * - 특징: 데이터가 없으면 빈 리스트 [] 반환
	 */
	@Override // 2026-03-22 이상학 : 작업한 최신순, 조회수 순, 좋아요 순 날아간거 복구했습니다.
	@Transactional(readOnly = true)
	public List<PostResponse> getAllPost(Boolean routeIdIsNull, String sort, String search, List<String> tags) {
		log.debug("[Service] 게시글 전체 조회 요청 발생 - routeIdIsNull: {}, sort: {}", routeIdIsNull, sort);

		String normalizedSort = (sort == null || sort.isBlank()) ? "latest" : sort.trim().toLowerCase();

		List<PostEntity> posts;

		if (Boolean.TRUE.equals(routeIdIsNull)) {
			posts = switch (normalizedSort) {
				case "view" -> postRepository.findAllByRouteIsNullOrderByViewCountDescCreatedAtDesc();
				case "like" -> postRepository.findAllByRouteIsNullOrderByLikeCountDescCreatedAtDesc();
				case "latest", "createdat" -> postRepository.findAllByRouteIsNullOrderByCreatedAtDesc();
				default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다: " + sort);
			};
		} else {
			posts = switch (normalizedSort) {
				case "view" -> postRepository.findAllByRouteIsNotNullOrderByViewCountDescCreatedAtDesc();
				case "like" -> postRepository.findAllByRouteIsNotNullOrderByLikeCountDescCreatedAtDesc();
				case "latest", "createdat" -> postRepository.findAllByRouteIsNotNullOrderByCreatedAtDesc();
				default -> throw new IllegalArgumentException("지원하지 않는 정렬 방식입니다: " + sort);
			};
		}

		return posts.stream()
				// 검색어 필터: 제목 또는 내용에 포함되는지 확인
				.filter(post -> (search == null || search.isBlank())
						|| post.getTitle().contains(search)
						|| post.getContent().contains(search))
				// 태그 필터: 선택한 태그를 하나라도 가지고 있는지 확인
				.filter(post -> (tags == null || tags.isEmpty())
						|| post.getPostTags().stream()
						.anyMatch(pt -> tags.contains(pt.getTag().getTagName())))
				.map(PostResponse::fromEntity)
				.collect(Collectors.toUnmodifiableList());
	}

	/**
	 * 2. 게시글 단건 조회
	 * @param postId (필수) 조회할 게시글 고유 ID
	 * @return PostResponse
	 * - 필수 반환: 해당 ID의 모든 게시글 데이터 및 관련 태그 리스트
	 * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
	 */
	@Override
	@Transactional(readOnly = true)
	public PostResponse getPostById(Long postId) {
		log.debug("[Service] 게시글 단건 조회 시작 - ID: {}", postId);

		return postRepository.findById(postId)
				.map(entity -> {
					log.debug("[Service] 게시글 조회 성공: {}", entity.getTitle());
					return PostResponse.fromEntity(entity);
				})
				.orElseThrow(() -> {
					log.debug("[Service] 조회 실패: {}번 게시글이 존재하지 않음", postId);
					return new RuntimeException("게시글을 찾을 수 없습니다.");
				});
	}

	/**
	 * 3. 게시글 작성
	 * @param request (PostRequest DTO)
	 * - [필수 입력]: title (제목), content (내용)
	 * - [선택 입력]: tagNames (태그 리스트)
	 * @return PostResponse
	 * - 필수 반환: 생성된 게시글의 모든 정보 (ID, 생성시간, 태그 리스트 포함)
	 */
	@Override
	public PostResponse createPost(PostRequest request) { // 파라미터를 PostRequest로 변경
		
		// 0. SecurityContext에서 직접 로그인 아이디 추출
		// [로그인 여부 2중 확인]
//		 - null: 인증 정보 자체가 아예 생성되지 않은 경우
//		 - "anonymousUser": 로그인은 안 했지만 접속은 유지 중인 '익명 사용자'인 경우
//		 위 두 경우에는 글을 쓸 수 없으므로 에러를 발생시켜 차단합니다.
		String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
		
		if (currentUserId == null || currentUserId.equals("anonymousUser")) {
			throw new RuntimeException("인증 정보가 없습니다. 로그인이 필요합니다.");
		}
		
		log.debug("[Service] 게시글 등록 요청 시작 - 제목: {}", request.getTitle());
		
		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
		
		RouteEntity route = null;
		if (request.getRouteId() != null) {
			route = routeRepository.findById(request.getRouteId())
					.orElseThrow(() -> new RuntimeException("지정한 루트를 찾을 수 없습니다."));
		}
		
		
		// 1. 엔티티 생성 (기본 정보 초기화)
		// status, viewCount, likeCount 등은 생성 시점에 서버에서 강제로 초기값을 부여합니다.
		PostEntity postEntity = PostEntity.builder()
				.user(user)
				.route(route)
				.title(request.getTitle())
				.content(request.getContent())
				.status(PostEntity.PostStatus.PUBLIC) // 초기 상태는 PUBLIC으로 강제 설정
				.viewCount(0)
				.likeCount(0)
				.createdAt(LocalDateTime.now())
				.updateAt(LocalDateTime.now())
				.build();
		
		//먼저 저장하여 postId 받기
		postEntity = postRepository.save(postEntity);
		
		// 1-1 이미지 넣기
		if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
			log.debug("[Service] 이미지 매핑 처리 시작: {}개", request.getImageUrl().size());
			
			for (int i = 0; i < request.getImageUrl().size(); i++) {
				String url = request.getImageUrl().get(i);
				
				PostImageEntity imageEntity = PostImageEntity.builder()
						.post(postEntity) // 게시글 연결
						.imageUrl(url)
						.sortOrder(i)    // 리스트에 들어온 순서대로 0, 1, 2... 부여
						.createdAt(LocalDateTime.now())
						.build();
				
				// PostEntity의 이미지 리스트에 추가 (Cascade 설정)
				// postEntity에 이미지를 추가함과 동시에 연관관계 설정
				postEntity.addPostImage(imageEntity);
			}
		}
		
		// 2. 태그 처리: 요청 DTO에 태그 이름 리스트가 포함되어 있다면 매핑 진행
		// addTagsToPost 내부에서 TagEntity 조회/생성 및 PostTagEntity 연결이 일어납니다.
		if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
			log.debug("[Service] 태그 매핑 처리 시작: {}개", request.getTagNames().size());
			addTagsToPost(postEntity, request.getTagNames());
		}

		log.debug("[Service] 게시글 및 태그 저장 완료 - 생성된 ID: {}", postEntity.getPostId());

		// 3. 저장된 엔티티를 응답용 DTO로 변환하여 반환
		// @Transactional 덕분에 메서드가 끝날 때 변경사항(이미지, 태그)이 자동으로 DB에 반영됨
		return PostResponse.fromEntity(postEntity);
	}
	
	/**
	 * 4. 게시글 삭제
	 * @param postId (필수) 삭제할 게시글 고유 ID
	 * @return void (성공 시 리턴값 없음, 컨트롤러에서 성공 메시지 처리)
	 * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
	 */
	public void deletePost(Long postId, String userId) {
		// 존재하는 게시물인가 확인
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> {
					log.debug("!!! [Service] 삭제 실패: {}번 게시글이 없습니다.", postId);
					return new RuntimeException("삭제할 게시글을 찾을 수 없습니다.");
				});
		
		// 2. 작성자 검증
		// 실제 작성자와 현재 유저의 아이디 검수
		if (!postEntity.getUser().getUserId().equals(userId)) {
			log.debug("작성자가 아닙니다. 게시글 작성자 ID: {}, 로그인 유저 ID: {}",
					postEntity.getUser().getUserId(), userId);
			log.debug("본인꺼만 삭제 가능합니다");
			throw new RuntimeException("본인이 작성한 글만 삭제할 수 있습니다.");
		}
		
		postRepository.deleteById(postId);
		log.debug("[Service] ID : {} 데이터가  삭제되었습니다.", postId);
	}
	
	/**
	 * 5. 게시글 수정
	 * @param postId (필수) 수정할 게시글 고유 ID
	 * @param request (PostRequest DTO)
	 * - [필수 입력]: title (제목), content (내용), status (공개 여부)
	 * - [선택 입력]: tagNames (수정할 태그 리스트)
	 * @return PostResponse
	 * - 필수 반환: 수정 및 태그 교체가 완료된 최신 데이터 (변경된 updateAt 포함)
	 * - 예외: 수정 대상 게시글이 없을 경우 RuntimeException 발생
	 */
	@Override
	public PostResponse updatePost(Long postId, String userId , PostRequest request) {
		// 1. 기존 게시글 조회 (없으면 예외 발생)
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> {
					log.debug("[Service] 수정 실패: {}번 게시글이 없습니다.", postId);
					return new RuntimeException("수정할 게시글을 찾을 수 없습니다.");
				});
		
		// 작성자 검증
		if (!postEntity.getUser().getUserId().equals(userId)) {
			log.debug("본인꺼만 수정 가능합니다");
			throw new RuntimeException("본인이 작성한 글만 수정할 수 있습니다.");
		}
		// 2. 엔티티 데이터 업데이트
		// 실제로는 route 객체도 새로 찾아와서 수정하는거 고려
		postEntity.setTitle(request.getTitle());
		postEntity.setContent(request.getContent());
		postEntity.setStatus(request.getStatus());
		postEntity.setUpdateAt(LocalDateTime.now());
		
		// 2. 기본 정보 업데이트 (JPA Dirty Checking 활용)
		// 따로 save()를 호출하지 않아도 트랜잭션 종료 시점에 변경 사항이 DB에 반영됩니다.
		postEntity.setTitle(request.getTitle());
		postEntity.setContent(request.getContent());
		// 피드백 반영: status가 null이면 기존 값을 유지하도록 조건문 추가
		if (request.getStatus() != null) {
			postEntity.setStatus(request.getStatus());
		}
		postEntity.setUpdateAt(LocalDateTime.now()); // 수정 시간 갱신

		// 3. 태그 수정 (기존 매핑 전체 제거 후 신규 등록)
		// PostEntity의 orphanRemoval = true 설정 덕분에 clear() 호출 시 기존 매핑 데이터가 DB에서 자동 삭제됩니다.
		log.debug("[Service] 기존 태그 초기화 및 신규 태그 매핑 시작");
		postEntity.getPostTags().clear();

		if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
			addTagsToPost(postEntity, request.getTagNames());
		}

		log.debug("[Service] 게시글 정보 및 {}개의 태그 수정 완료",
				request.getTagNames() != null ? request.getTagNames().size() : 0);
		
		// 수정된 엔티티를 다시 DTO로 변환해서 반환
		PostResponse postResponse = PostResponse.fromEntity(postEntity);
		log.debug("[Service] 최종 변환된 응답 DTO: {}", postResponse);
		return postResponse;
	}

	/**
	 * 6. 게시글 좋아요 증감
	 * @param postId (필수) 좋아요를 누를 게시글 고유 ID
	 * @return PostResponse
	 * - 필수 반환: likeCount가 +1 된 후의 전체 게시글 정보
	 * - 예외: 게시글이 없을 경우 EntityNotFoundException 발생
	 */
	@Override
	public PostResponse likePost(Long postId) {
		log.debug("[Service] 좋아요 요청 - ID: {}", postId);

		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> new EntityNotFoundException("게시글 없음: " + postId));

		int oldLikes = (postEntity.getLikeCount() == null) ? 0 : postEntity.getLikeCount();
		postEntity.setLikeCount(oldLikes + 1);

		log.debug("[Service] 좋아요 반영 완료 ({} -> {})", oldLikes, postEntity.getLikeCount());
		return PostResponse.fromEntity(postEntity);
	}

	/**
	 * [내부 메서드] 게시글과 태그 이름을 매핑하여 저장하는 공통 로직
	 * @param post 대상 게시글 엔티티
	 * @param tagNames 추가할 태그 이름 리스트
	 */
	private void addTagsToPost(PostEntity post, List<String> tagNames) {
		tagNames.forEach(rawName -> {
			String name = rawName == null ? null : rawName.trim();
			
			if (name == null || name.isBlank()) {
				return;
			}
			// DB에 이미 저장된 태그만 선택해서 연결합니다.
			// 존재하지 않는 태그는 새로 만들지 않고 예외를 발생시킵니다.
			TagEntity tag = tagRepository.findByTagName(name)
					.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 태그입니다: " + name));
			
			// 같은 게시글에 동일한 태그가 중복으로 연결되지 않도록 한 번 더 확인합니다.
			boolean alreadyMapped = post.getPostTags().stream()
					.anyMatch(postTag -> postTag.getTag().getTagId().equals(tag.getTagId()));
			
			if (!alreadyMapped) {
				// 게시글과 태그의 연결 정보만 생성합니다.
				// 태그 본체(TagEntity)는 여기서 새로 만들지 않습니다.
				PostTagEntity postTag = PostTagEntity.create(post, tag);
				post.getPostTags().add(postTag);
			}
		});
	}
}