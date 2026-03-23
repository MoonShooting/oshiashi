package project.oshiashi.oshiashi.domain.post.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
	
	// 1. 전체 조회 (루트가 있는 게시판)
	@GetMapping
	public ResponseEntity<List<PostResponse>> getPosts(
			@RequestParam(required = false, defaultValue = "latest") String sort,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) List<String> tags
	) {
		List<PostResponse> responses = postService.getAllPost(false, sort, search, tags);
		return ResponseEntity.ok(responses);
	}
	// 1-1. 전체 조회 (루트가 없는 자유 게시판)
	@GetMapping("/notroute")
	public ResponseEntity<List<PostResponse>> getPostsNotRoute(
			@RequestParam(required = false, defaultValue = "latest") String sort,
			@RequestParam(required = false) String search,
			@RequestParam(required = false) List<String> tags
	) {
		return ResponseEntity.ok(postService.getAllPost(true, sort, search, tags));
	}
	
	
	// 2. 하나 조회
	@GetMapping("/{postId}")
	public PostResponse getPostById(@PathVariable Long postId) {
		return postService.getPostById(postId);
	}
	
	// 3. 게시글 작성 (DB에 영구 저장)
	@PostMapping
	public PostResponse createPost(@Valid @RequestBody PostRequest request,
								   @AuthenticationPrincipal UserDetails userDetails) {
		
		// 인증된 유저,  따라서 서버(시큐리티)가 이미 인증한 유저의 ID(username)를 꺼내서
		request.setUserId(userDetails.getUsername());
		
		log.debug("[Controller] 유저 {}의 게시글 작성 시도", userDetails.getUsername());
		
		PostResponse savedResponse = postService.createPost(request);
		
		log.debug("[Controller] 작성 완료! 생성된 게시글 ID: {}", savedResponse.getPostId());
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
	public PostResponse updatePost(@PathVariable Long postId, @RequestParam String userId ,@Valid @RequestBody PostRequest request) {
		
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

	// 인기글 목록 조회
	// 현재는 좋아요가 많은 순으로 상위 10개의 게시글을 반환합니다.
	@GetMapping("/top")
	public ResponseEntity<List<PostResponse>> getTopPosts() {
		return ResponseEntity.ok(postService.getTopPosts());
	}

}
