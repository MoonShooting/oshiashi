package project.oshiashi.oshiashi.domain.comment.service;

//import jakarta.transaction.Transactional;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.comment.dto.CommentCreateRequest;
import project.oshiashi.oshiashi.domain.comment.dto.CommentResponse;
import project.oshiashi.oshiashi.domain.comment.dto.CommentUpdateRequest;
import project.oshiashi.oshiashi.domain.comment.entity.CommentEntity;
import project.oshiashi.oshiashi.domain.comment.repository.CommentRepository;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;
import project.oshiashi.oshiashi.domain.post.repository.PostRepository;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import project.oshiashi.oshiashi.security.AuthenticatedUser;


import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Override
    public CommentResponse createComment(Long postId, CommentCreateRequest request) {
        UserEntity me = getCurrentUserEntity();

        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. postId=" + postId));

        CommentEntity comment = CommentEntity.builder()
                .post(post)
                .user(me)
                .content(request.getContent())
                .createdAt(LocalDateTime.now())
                .build();

        CommentEntity saved = commentRepository.save(comment);
        return CommentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPost(Long postId) {
        return commentRepository.findByPost_PostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(CommentResponse::fromEntity)
                .toList();
    }

    @Override
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request) {
        UserEntity me = getCurrentUserEntity();

        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다. commentId=" + commentId));

        // 작성자만 수정 가능
        if (!comment.getUser().getUserId().equals(me.getUserId())) {
            throw new IllegalStateException("댓글 수정 권한이 없습니다.");
        }

        comment.updateContent(request.getContent());
        return CommentResponse.fromEntity(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        UserEntity me = getCurrentUserEntity();

        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다. commentId=" + commentId));

        // 작성자만 삭제 가능
        if (!comment.getUser().getUserId().equals(me.getUserId())) {
            throw new IllegalStateException("댓글 삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }

    private UserEntity getCurrentUserEntity() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 인증 안 된 상태면 principal이 String("anonymousUser")일 수 있음
        if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        return authenticatedUser.user();
    }
}
