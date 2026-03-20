package project.oshiashi.oshiashi.domain.post.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.oshiashi.oshiashi.domain.post.dto.PostRequest;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.entity.PostTagEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.tag.entity.TagEntity;
import project.oshiashi.oshiashi.domain.tag.repository.TagRepository;
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
	// private final PostRequest postRequest;

	/**
	 * 1. 게시글 전체 조회
	 * @return List<PostResponse>
	 * - 필수 반환: 모든 필드 (postId, title, content, status, viewCount, likeCount, tagNames, createdAt, updateAt)
	 * - 특징: 데이터가 없으면 빈 리스트 [] 반환
	 */
	@Override
	@Transactional(readOnly = true)
	public List<PostResponse> getAllPost() {
		log.debug("[Service] 게시글 전체 조회 요청 발생");
		List<PostEntity> posts = postRepository.findAll();
		log.debug("[Service] 조회된 게시글 총 개수: {}개", posts.size());

		return posts.stream()
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
		log.debug("[Service] 게시글 등록 요청 시작 - 제목: {}", request.getTitle());

		// 1. 엔티티 생성 (기본 정보 초기화)
		// status, viewCount, likeCount 등은 생성 시점에 서버에서 강제로 초기값을 부여합니다.
		PostEntity postEntity = PostEntity.builder()
				.title(request.getTitle())
				.content(request.getContent())
				.status(PostEntity.PostStatus.PUBLIC) // 초기 상태는 PUBLIC으로 강제 설정
				.viewCount(0)
				.likeCount(0)
				.createdAt(LocalDateTime.now())
				.updateAt(LocalDateTime.now())
				.build();
		// 2. 태그 처리: 요청 DTO에 태그 이름 리스트가 포함되어 있다면 매핑 진행
		// addTagsToPost 내부에서 TagEntity 조회/생성 및 PostTagEntity 연결이 일어납니다.
		if (request.getTagNames() != null && !request.getTagNames().isEmpty()) {
			log.debug("[Service] 태그 매핑 처리 시작: {}개", request.getTagNames().size());
			addTagsToPost(postEntity, request.getTagNames());
		}
		// 3. 게시글 저장
		// PostEntity에 설정된 cascade = CascadeType.ALL에 의해 postTags 리스트 안의 PostTagEntity들도 함께 저장됩니다.
		PostEntity savedPost = postRepository.save(postEntity);

		log.debug("[Service] 게시글 및 태그 저장 완료 - 생성된 ID: {}", savedPost.getPostId());

		// 4. 저장된 엔티티를 응답용 DTO로 변환하여 반환
		return PostResponse.fromEntity(savedPost);
	}

	/**
	 * 4. 게시글 삭제
	 * @param postId (필수) 삭제할 게시글 고유 ID
	 * @return void
	 * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
	 * - 특징: Cascade 설정에 의해 관련 태그 매핑(PostTag)도 자동 삭제됨
	 */
	@Override
	public void deletePost(Long postId) {
		if (!postRepository.existsById(postId)) {
			log.debug("!!! [Service] 삭제 실패: {}번 게시글이 없습니다.", postId);
			throw new RuntimeException("삭제할 게시글을 찾을 수 없습니다.");
		}

		postRepository.deleteById(postId);
		log.debug("[Service] ID : {} 데이터가 삭제되었습니다.", postId);
	}

	/**
	 * 5. 게시글 수정
	 * @param postId (필수) 수정할 게시글 고유 ID
	 * @param request (DTO)
	 * - [필수 입력]: title, content, status, tagNames
	 * @return PostResponse
	 * - 필수 반환: 수정 및 태그 교체가 완료된 최신 데이터
	 * - 예외: 수정 대상 게시글이 없을 경우 RuntimeException 발생
	 */
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
	public PostResponse updatePost(Long postId, PostRequest request) { // 파라미터를 PostRequest로 변경
		log.debug("[Service] 게시글 수정 시작 - ID: {}", postId);

		// 1. 기존 게시글 조회 (DB에 데이터가 있는지 먼저 확인)
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> {
					log.debug("!!! [Service] 수정 실패: {}번 게시글이 존재하지 않음", postId);
					return new RuntimeException("수정할 게시글을 찾을 수 없습니다.");
				});

		// 2. 기본 정보 업데이트 (JPA Dirty Checking 활용)
		// 따로 save()를 호출하지 않아도 트랜잭션 종료 시점에 변경 사항이 DB에 반영됩니다.
		postEntity.setTitle(request.getTitle());
		postEntity.setContent(request.getContent());
		postEntity.setStatus(request.getStatus());
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

		// 4. 수정이 완료된 엔티티를 응답용 DTO로 변환하여 반환
		return PostResponse.fromEntity(postEntity);
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
	 * [내부 메서드] 게시글과 기존 태그를 매핑하는 공통 로직
	 * - 유저가 태그를 직접 생성하지 않고,
	 *   DB에 미리 존재하는 태그만 선택해서 연결하는 정책을 따름에 따른 수정
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