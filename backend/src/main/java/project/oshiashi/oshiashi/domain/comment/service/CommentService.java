package project.oshiashi.oshiashi.domain.comment.service;

import org.springframework.data.domain.Pageable;
import project.oshiashi.oshiashi.domain.comment.dto.CommentCreateRequest;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.dto.CommentUpdateRequest;

import java.util.List;

public interface CommentService {
    CommentResponse createComment(Long postId, CommentCreateRequest request);
    List<CommentResponse> getCommentsByPost(Long postId);
    // 페이지네이션 적용 댓글 조회
    List<CommentResponse> getCommentsByPost(Long postId, Pageable pageable);
    CommentResponse updateComment(Long commentId, CommentUpdateRequest request);
    void deleteComment(Long commentId);

    CommentResponse createReply(Long parentId, CommentCreateRequest request);

    List<CommentResponse> getReplies(Long parentId);
}
