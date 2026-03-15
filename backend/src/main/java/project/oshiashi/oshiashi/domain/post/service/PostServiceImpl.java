package project.oshiashi.oshiashi.domain.post.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.artwork.entity.ArtworkEntity;
import project.oshiashi.oshiashi.domain.artwork.service.ArtworkResolveService;
import project.oshiashi.oshiashi.domain.post.dto.PostCreateRequest;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.tag.service.TagService;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService{
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final RouteRepository routeRepository;
	private final ArtworkResolveService artworkResolveService;
	private final TagService tagService;
	
	/**
	 * 1. 게시글 전체 조회
	 * @return List<PostResponse>
	 * - 필수 반환: 모든 필드 (postId, title, content, userId, routeId, status, viewCount, likeCount, createdAt, updateAt)
	 * - 특징: 데이터가 없으면 빈 리스트 [] 반환
	 */
	@Override
	public List<PostResponse> getAllPost() {
		return postRepository.findAll().stream()
				.map(PostResponse::fromEntity)
				.collect(Collectors.toUnmodifiableList());
		//Collectors.toUnmodifiableList()는 스트림의 결과를 수집할 때,
		//추가(add), 삭제(remove), 수정(set)이 불가능한 리스트를 반환. (원본의 게시글은 유지하는 느낌)
	}
	
	/**
	 * 2. 게시글 단건 조회
	 * @param postId  (필수) 조회할 게시글 고유 ID
	 * @return PostResponse
	 * - 필수 반환: 해당 ID의 모든 게시글 데이터
	 * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
	 */
	@Override
	public PostResponse getPostById(Long postId) {
		return postRepository.findById(postId)
				.map(PostResponse::fromEntity)
				.orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
	}
	
	/**
	 * 3. 게시글 작성
	 * @param request (DTO)
	 *  - [입력]: userId, routeId, artworkTitle, title, content, status
	 *  - [동작]: 작성자/루트 조회 후 작품 정보를 확보하고 게시글을 저장
	 * @return PostResponse
	 * - 필수 반환: DB에 저장된 최종 데이터 (자동 생성된 postId 포함)
	 * - 특징: 작성 시 viewCount, likeCount는 0으로, status는 PUBLIC으로 강제 초기화됨
	 */
	@Override
	public PostResponse createPost(PostCreateRequest request) {
		
		// [테스트 로깅 추가] 제목과 내용 입력값 확인
		log.debug("======= Post 등록 테스트 =======");
		log.debug("입력된 제목: {}", request.getTitle());
		log.debug("입력된 내용: {}", request.getContent());
		log.debug("================================");

		// TODO: 입력값 유효성 검사 및 예외 처리 고도화

		// 1. 작성자 정보와 루트 정보를 DB에서 조회
		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

		RouteEntity route = routeRepository.findById(request.getRouteId())
				.orElseThrow(() -> new RuntimeException("루트를 찾을 수 없습니다."));

		// 2. 작품 정보 확보
		ArtworkEntity artwork = artworkResolveService.getOrCreateArtwork(request.getArtworkTitle());

		// 3. 작품 태그 확보
		tagService.getOrCreateArtworkTag(artwork);

		// 4. DB에 저장할 엔티티 생성
		PostEntity postEntity = PostEntity.builder()
				.user(user)
				.route(route)
				.title(request.getTitle())
				.content(request.getContent())
				.status(request.getStatus() != null ? request.getStatus() : PostEntity.PostStatus.PUBLIC)
				.viewCount(0)
				.likeCount(0)
				.createdAt(LocalDateTime.now())
				.updateAt(LocalDateTime.now())
				.build();

		PostEntity savedPost = postRepository.save(postEntity);

		log.debug(">>> [Service] post 저장 성공! (자동 생성된 postId: {})", savedPost.getPostId());
		return PostResponse.fromEntity(savedPost);
	}
	
	/**
     * 4. 게시글 삭제
     * @param postId (필수) 삭제할 게시글 고유 ID
     * @return void (성공 시 리턴값 없음, 컨트롤러에서 성공 메시지 처리)
     * - 예외: ID가 존재하지 않을 경우 RuntimeException 발생
     */
	@Override
	public void deletePost(Long postId) {
		if (!postRepository.existsById(postId)) {
			log.debug("!!! [Service] 삭제 실패: {}번 게시글이 없습니다.", postId);
			throw new RuntimeException("삭제할 게시글을 찾을 수 없습니다.");
		}
		
		postRepository.deleteById(postId);
		log.debug(">>> [Service] ID : {} 데이터가  삭제되었습니다.", postId);
	}
	
	/**
	 * 5. 게시글 수정
	 * @param postId (필수) 수정할 게시글 고유 ID
	 * @param request (DTO)
	 * - [필수 입력]: title, content, status (수정할 데이터들)
	 * @return PostResponse
	 * - 필수 반환: 수정이 완료된 후의 최신 데이터 (변경된 updateAt 포함)
	 * - 예외: 수정 대상 게시글이 없을 경우 RuntimeException 발생
	 */
	@Override
	public PostResponse updatePost(Long postId, PostCreateRequest request) {
		// 1. 기존 게시글 조회 (없으면 예외 발생)
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> new RuntimeException("수정할 게시글을 찾을 수 없습니다."));
		
		// 2. 엔티티 데이터 업데이트
		// 실제로는 route 객체도 새로 찾아와서 수정하는거 고려
		postEntity.setTitle(request.getTitle());
		postEntity.setContent(request.getContent());
		postEntity.setStatus(
				request.getStatus() != null ? request.getStatus() : postEntity.getStatus()
		);
		postEntity.setUpdateAt(LocalDateTime.now());
		
		// 3. 수정된 엔티티를 다시 DTO로 변환해서 반환
		PostResponse postResponse = PostResponse.fromEntity(postEntity);
		log.debug(">>> [Service] 최종 변환된 응답 DTO: {}", postResponse);
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
		// 1. DB에서 해당 게시글 조회 (없으면 예외 발생)
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> {
					log.debug("!!! [Service] 좋아요 실패: {}번 게시글이 DB에 없습니다.", postId);
					return new EntityNotFoundException("게시글 없음: " + postId);
				});
		
		// 2. 좋아요 수 증가 (기존 값이 null일 경우를 대비해 처리)
		int oldLikes = (postEntity.getLikeCount() == null) ? 0 : postEntity.getLikeCount();
		postEntity.setLikeCount(oldLikes + 1);
		
		log.debug(">>> [Service] 좋아요 반영 완료: {} -> {}", oldLikes, postEntity.getLikeCount());
		
		// 3. DTO로 변환하여 반환 (DB에 반영됨)
		return PostResponse.fromEntity(postEntity);
	}
	
}
