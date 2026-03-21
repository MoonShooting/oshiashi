package project.oshiashi.oshiashi.domain.post.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.service.CommentService;
import project.oshiashi.oshiashi.domain.post.dto.PostRequest;
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
	public List<PostResponse> getAllPost(
			@RequestParam(defaultValue = "latest") String sort
	) {
		log.debug("[Controller] 게시글 목록 조회 요청 - sort : {}", sort);
		return postService.getAllPost(sort);
	}
	
	
	// 2. 하나 조회
	@GetMapping("/{postId}")
	public PostResponse getPostById(@PathVariable Long postId) {
		return postService.getPostById(postId);
	}
	
	// 3. 게시글 작성 (DB에 영구 저장)
	@PostMapping
	public PostResponse createPost(@RequestBody PostRequest request) {
		PostResponse savedResponse = postService.createPost(request);
		
		log.debug(">>> [Controller] 작성 완료! 생성된 게시글 ID: {}", savedResponse.getPostId());
		return savedResponse;
		
	}
	
	// 4. 게시글 삭제
	@DeleteMapping("/{postId}")
	public String deletePost(@PathVariable Long postId, @RequestParam String userId) {
		postService.deletePost(postId, userId);
		
		log.debug("[Controller] 유저 {}가 {}번 게시글 삭제 요청", userId, postId);
		return postId + "번 게시글이 삭제되었습니다.";
	}
	
	// 5. 게시글 수정
	// 수정할 대상이 누구인지 주소(Path)에 명시, Param : 이 요청을 보내는 사람이 누구인가?
	@PatchMapping("/{postId}")
	public PostResponse updatePost(@PathVariable Long postId, @RequestParam String userId , @RequestBody PostRequest request) {
		
		log.debug("[Controller] 유저 {}가 {}번 게시글 수정 요청", userId, postId);
		
		return postService.updatePost(postId,userId, request);
	}
	
	// 6. 게시글 좋아요 기능
	@PostMapping("/{postId}/like")
	public PostResponse likePost(@PathVariable Long postId) {
		log.debug(">>> [Controller] 좋아요 클릭! 대상 게시글 ID: {}", postId);
		
		PostResponse updatedPost = postService.likePost(postId);
		
		log.info(">>> [Controller] 좋아요 반영 완료. 현재 좋아요 수: {}", updatedPost.getLikeCount());
		return updatedPost;
	}
	
	
}
