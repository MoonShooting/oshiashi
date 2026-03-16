package project.oshiashi.oshiashi.domain.post.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.service.CommentService;
import project.oshiashi.oshiashi.domain.post.dto.PostResponse;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.service.PostService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
public class PostController {
	private final PostService postService;
	private final CommentService commentService;
	
	// DB 연동 전까지 데이터를 담아둘 임시 리스트 (테스트용)
	// 0. 임시 리스트 (static 유지)
	//private static List<PostResponse> postListTest = new ArrayList<>();
	
	// 1. 전체 조회 (DB에서 가져옴)
	@GetMapping
	public List<PostResponse> getAllPost() {
		return postService.getAllPost();
	}
	
	
	// 2. 하나 조회
	@GetMapping("/{postId}")
	public PostResponse getPostById(@PathVariable Long postId) {
		return postService.getPostById(postId);
	}
	
	// 3. 게시글 작성 (DB에 영구 저장)
	@PostMapping
	public PostResponse createPost(@RequestBody PostResponse request) {
		PostResponse savedResponse = postService.createPost(request);
		
		log.debug(">>> [Controller] 작성 완료! 생성된 게시글 ID: {}", savedResponse.getPostId());
		return savedResponse;
		
	}
	
	// 4. 게시글 삭제
	@DeleteMapping("/{postId}")
	public String deletePost(@PathVariable Long postId) {
		postService.deletePost(postId);
		
		log.debug(">>> [Controller] ID : {}, 게시글 삭제 완료", postId);
		return postId + "번 게시글이 삭제되었습니다.";
	}
	
	// 5. 게시글 수정
	@PatchMapping("/{postId}")
	public PostResponse updatePost(@PathVariable Long postId, @RequestBody PostResponse request) {
		
		log.debug(">>> [Controller] 게시글 수정 요청 발생! ID: {}", postId);
		
		return postService.updatePost(postId, request);
	}
	
	// 6. 게시글 좋아요 기능
	@PostMapping("/{postId}/like")
	public PostResponse likePost(@PathVariable Long postId) {
		log.debug(">>> [Controller] 좋아요 클릭! 대상 게시글 ID: {}", postId);
		
		PostResponse updatedPost = postService.likePost(postId);
		
		log.info(">>> [Controller] 좋아요 반영 완료. 현재 좋아요 수: {}", updatedPost.getLikeCount());
		return updatedPost;
	}
	
	// 7. 특정 게시글에 달린 모든 댓글 목록을 조회합니다.
	// 댓글을 조회할 게시글의 ID
	// 해당 게시글의 댓글 리스트 (CommentResponse 목록)
	@GetMapping("/{postId}/comments")
	public ResponseEntity<List<CommentResponse>> getCommentsByPost(
			@PathVariable(name = "postId") Long postId
	) {
		
		log.debug("댓글 목록 조회 요청 - 게시글 번호: {}", postId);
		
		// 1. 서비스에서 해당 게시글의 댓글 목록을 가져옴
		List<CommentResponse> comments = commentService.getCommentsByPost(postId);
		
		// 2. 로그로 결과 개수 확인 (디버깅용)
		log.debug("조회된 댓글 개수: {}", comments.size());
		
		// 3. 리스트와 함께 200 OK 응답
		return ResponseEntity.ok(comments);
	}
	
	
	

	
	// 포스트맨 테스트용 더미 데이터
	/*
	@GetMapping("/test")
	public List<PostResponse> test() {
		return List.of(
				PostResponse.builder()
						.postId(1L)
						.userId("oshi_lover_99") // String 타입
						.routeId(101L)
						.title("이번 주말에 다녀온 가마쿠라 성지순례 후기")
						.content("날씨가 너무 좋아서 슬램덩크 건널목에서 사진이 잘 나왔네요!")
						.status(PostEntity.PostStatus.valueOf("PUBLIC"))
						.viewCount(150)
						.likeCount(45)
						.createdAt(LocalDateTime.now())
						.updateAt(LocalDateTime.now())
						//.images(dummyImages)
						.build()
		);
	}
	
	
	 */
	
}
