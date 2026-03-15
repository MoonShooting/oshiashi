package project.oshiashi.oshiashi.domain.comment.service;

//import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;

    @Override
    public CommentResponse createComment(Long postId, CommentCreateRequest request) {
        
        log.debug("======= Comment 등록 테스트 =======");
        log.debug("입력된 내용: {}", request.getContent());
        log.debug("================================");
        
        // 현재 로그인한 사용자 정보 가져오기
        // TODO : 누군지 확인이 되면(보안통과) UserEntity 객체로 변환
        UserEntity userEntity = getCurrentUserEntity();

        // 게시글 존재 여부 확인
        PostEntity post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. postId=" + postId));
        
        // Comment 엔티티 생성 (Builder 패턴 사용)
        CommentEntity comment = CommentEntity.builder()
                .post(post)
                .user(userEntity)
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
        validateContent(request.getContent());
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

    //TODO : 서큐리티 보안단 post 랑 연동해서 보안 통과한 사람만 게시물 작성 가능한 부분
    private UserEntity getCurrentUserEntity() {
        // TODO : 실제 사용자 정보 확인
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.debug("현재 로그인 상태 검사 : {}", principal);
        // 인증 안 된 상태면 principal이 String("anonymousUser")일 수 있음
        if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }
        log.debug("통과 여부 체크 : {}", principal);
        return authenticatedUser.user();
    }
    // TODO: 보안 설정(SecurityConfig)이 완료되기 전까지는
    //  SecurityContextHolder에 아무 값도 들어있지 않아 NullPointerException이 발생할 수 있음.
    //  또는 로그인하지 않은 상태면 principal이  ClassCastException 발생.

    // 만약 댓글이 비어있거나 255자를 넘었는지를 판단합니다
    private void validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("댓글 내용은 비어 있을 수 없습니다.");
        }

        if (content.length() > 255) {
            throw new IllegalArgumentException("댓글 내용은 255자를 초과할 수 없습니다.");
        }
    }
}
