package project.oshiashi.oshiashi.domain.post.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.route.entity.RouteEntity;
import project.oshiashi.oshiashi.domain.route.repository.RouteRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Builder
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService{
	private final PostRepository postRepository;
	private final UserRepository userRepository;
	private final RouteRepository routeRepository;
	
	@Override
	public List<PostResponse> getAllPost() {
		return postRepository.findAll().stream()
				.map(PostResponse::fromEntity)
				.collect(Collectors.toUnmodifiableList());
		//Collectors.toUnmodifiableList()는 스트림의 결과를 수집할 때,
		//추가(add), 삭제(remove), 수정(set)이 불가능한 리스트를 반환. (원본의 게시글은 유지하는 느낌)
	}
	
	@Override
	public PostResponse getPostById(Long postId) {
		return postRepository.findById(postId)
				.map(PostResponse::fromEntity)
				.orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
	}
	
	// 3. 게시글 작성 (컨트롤러의 빌더 로직을 서비스로 이동)
	@Override
	public PostResponse createPost(PostResponse request) {
		
		// 1. 작성자 정보와 루트 정보를 DB에서 먼저 조회
		UserEntity user = userRepository.findById(request.getUserId())
				.orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
		
		RouteEntity route = routeRepository.findById(request.getRouteId())
				.orElseThrow(() -> new RuntimeException("루트를 찾을 수 없습니다."));
		
		// DB에 저장할 엔티티 생성
		PostEntity postEntity = PostEntity.builder()
				.user(user) // ← "이 유저가 쓴 글이야" 라고 객체를 연결
				.route(route)
				.title(request.getTitle())
				.content(request.getContent())
				.status(PostEntity.PostStatus.PUBLIC)
				.viewCount(0)
				.likeCount(0)
				.createdAt(LocalDateTime.now())
				.updateAt(LocalDateTime.now())
				.build();
		
		PostEntity savedPost = postRepository.save(postEntity);
		log.debug(">>> [Service] post 저장 성공! (자동 생성된 postId: {})", savedPost.getPostId());
		return PostResponse.fromEntity(savedPost);
	
	}
	
	@Override
	public void deletePost(Long postId) {
		if (!postRepository.existsById(postId)) {
			log.debug("!!! [Service] 삭제 실패: {}번 게시글이 없습니다.", postId);
			throw new RuntimeException("삭제할 게시글을 찾을 수 없습니다.");
		}
		
		postRepository.deleteById(postId);
		log.debug(">>> [Service] ID : {} 데이터가  삭제되었습니다.", postId);
	}
	
	@Override
	public PostResponse updatePost(Long postId, PostResponse request) {
		// 1. 기존 게시글 조회 (없으면 예외 발생)
		PostEntity postEntity = postRepository.findById(postId)
				.orElseThrow(() -> new RuntimeException("수정할 게시글을 찾을 수 없습니다."));
		
		// 2. 엔티티 데이터 업데이트
		// 실제로는 route 객체도 새로 찾아와서 수정하는거 고려
		postEntity.setTitle(request.getTitle());
		postEntity.setContent(request.getContent());
		postEntity.setStatus(request.getStatus());
		postEntity.setUpdateAt(LocalDateTime.now());
		
		// 3. 수정된 엔티티를 다시 DTO로 변환해서 반환
		PostResponse postResponse = PostResponse.fromEntity(postEntity);
		log.debug(">>> [Service] 최종 변환된 응답 DTO: {}", postResponse);
		return postResponse;
	}
	
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
