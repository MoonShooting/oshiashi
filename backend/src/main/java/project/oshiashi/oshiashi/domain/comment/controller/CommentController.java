package project.oshiashi.oshiashi.domain.comment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.comment.dto.CommentCreateRequest;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.dto.CommentUpdateRequest;
import project.oshiashi.oshiashi.domain.comment.service.CommentService;
import project.oshiashi.oshiashi.security.AuthenticatedUser;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    // 1) 댓글 작성: POST /api/v1/posts/{postId}/comments
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable(name = "postId") Long postId,
            @RequestBody CommentCreateRequest request
    ) {
        // commentService의 로직 호출
        log.debug("댓글 추가하는 게시글 번호 : {}", postId);
        log.debug("댓글 작성 유저 : {}", user.getUsername());
        log.debug("댓글 내용 : {}", request.getContent());
        
        // 생성 API는 보통 201이 더 자연스럽다
        return ResponseEntity.status(201).body(commentService.createComment(postId, request));
    }

    // 2) 댓글 목록: GET /api/posts/{postId}/comments
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getCommentsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPost(postId));
    }

    // 3) 댓글 수정: PUT /api/comments/{commentId}
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest request
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request));
    }

    // 4) 댓글 삭제: DELETE /api/comments/{commentId}
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}