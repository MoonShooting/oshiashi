package project.oshiashi.oshiashi.domain.comment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.oshiashi.oshiashi.domain.comment.dto.CommentCreateRequest;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.dto.CommentUpdateRequest;
import project.oshiashi.oshiashi.domain.comment.service.CommentService;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    // 1) 댓글 작성: POST /api/posts/{postId}/comments
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @RequestBody CommentCreateRequest request
    ) {
        // 생성 API는 보통 201이 더 자연스럽다
        return ResponseEntity.status(201).body(commentService.createComment(postId, request));
    }
    
    // 2. 특정 게시글에 달린 모든 댓글 목록을 조회합니다.
    @GetMapping("/posts/{postId}/comments")
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

    // 3) 댓글, 대댓글 수정: PUT /api/comments/{commentId}
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequest request
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request));
    }

    // 4) 댓글, 대댓글 삭제: DELETE /api/comments/{commentId}
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
    /*
    댓글 수정및 삭제 , 대갯글 수정및 삭제 와 같이 쓸수있는 이유
    - 댓글과 대댓글은 CommentEntity 클래스로 생성되기때문에 수정할떄 사용하는 매서드는 언제든 사용가능
    - 삭제는 comment_id 로 삭제하는데 결국 대댓글도 ex) 부모댓글 1번의 대댓글 comment_id 를 받기때문에
    //TODO : 부모 댓글을 삭제한다면  대댓글도 같이 없어짐
    */
    
    // 5) 대댓글 작성 (추가)
    @PostMapping("/comments/{parentId}/replies")
    public ResponseEntity<CommentResponse> createReply(
            @PathVariable Long parentId,
            @RequestBody CommentCreateRequest request
    ) {
        // 부모 댓글의 ID를 받아 서비스에서 처리
        return ResponseEntity.status(201).body(commentService.createReply(parentId, request));
    }
}
