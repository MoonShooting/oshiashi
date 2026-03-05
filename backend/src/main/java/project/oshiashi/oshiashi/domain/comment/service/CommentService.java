package project.oshiashi.oshiashi.domain.comment.service;

import project.oshiashi.oshiashi.domain.comment.dto.CommentCreateRequest;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.dto.CommentUpdateRequest;

import java.util.List;

public interface CommentService {
    CommentResponse createComment(Long postId, CommentCreateRequest request);
    List<CommentResponse> getCommentsByPost(Long postId);
    CommentResponse updateComment(Long commentId, CommentUpdateRequest request);
    void deleteComment(Long commentId);
}
