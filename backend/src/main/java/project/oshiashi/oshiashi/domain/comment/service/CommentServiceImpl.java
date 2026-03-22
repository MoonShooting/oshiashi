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
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;
import project.oshiashi.oshiashi.global.exception.BusinessException;
import project.oshiashi.oshiashi.global.exception.ErrorCode;
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
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.POST_NOT_FOUND,
                        "게시글이 존재하지 않습니다. postId=" + postId
                ));
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
        
        // 조회 시작 로그 (어떤 게시글의 댓글을 찾으려 하는지 기록)
        log.debug("댓글 목록 조회 시작 - 게시글 ID: {}", postId);
        // 게시글 존재 여부 우선 체크
        if (!postRepository.existsById(postId)) {
            log.debug("댓글 조회 실패: 존재하지 않는 게시글입니다. ID: {}", postId);
            throw new IllegalArgumentException("게시글이 존재하지 않습니다. ID=" + postId);
        }
        
        // Repository를 통해 댓글 엔티티 리스트 조회
        List<CommentEntity> commentEntities = commentRepository.findByPost_PostIdOrderByCreatedAtAsc(postId);
        
        // 조회 결과 로그 (결과가 몇 건인지 기록)
        log.debug("댓글 조회 완료 - 게시글 ID: {}, 조회된 댓글 수: {}개", postId, commentEntities.size());
        
        // Stream API를 사용하여 Entity 리스트를 Response DTO 리스트로 변환
        return commentEntities.stream()
                .map(CommentResponse::fromEntity)
                .toList();
    }

    @Override
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request) {
        validateContent(request.getContent());
        UserEntity userEntity = getCurrentUserEntity();
        
        // 수정 대상 댓글 조회
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> {
                    log.debug("댓글 수정 실패: 존재하지 않는 댓글 ID = {}", commentId);
                    return new IllegalArgumentException("댓글이 존재하지 않습니다.");
                });

        // 작성자만 수정 가능
        if (!comment.getUser().getUserId().equals(userEntity.getUserId())) {
            log.debug("댓글 수정 권한 없음: 요청자={}, 작성자={}", userEntity.getUserId(), comment.getUser().getUserId());
            throw new BusinessException(
                    ErrorCode.ACCESS_DENIED,
                    "댓글 수정 권한이 없습니다."
            );
        }
        // 수정 내용 로그 기록
        log.debug("댓글 내용 변경: [{}] -> [{}]", comment.getContent(), request.getContent());

        comment.updateContent(request.getContent());
        return CommentResponse.fromEntity(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        UserEntity userEntity = getCurrentUserEntity();
        
        // 삭제 대상 댓글 조회 및 로그
        CommentEntity comment = commentRepository.findById(commentId)
                .orElseThrow(() -> {
                    log.debug("댓글 삭제 실패: 존재하지 않는 댓글 ID = {}", commentId);
                    return new IllegalArgumentException("댓글이 존재하지 않습니다.");
                });
        
        // 작성자만 삭제 가능
        if (!comment.getUser().getUserId().equals(userEntity.getUserId())) {
            log.debug("댓글 삭제 권한 없음: 요청자={}, 작성자={}", userEntity.getUserId(), comment.getUser().getUserId());
            throw new BusinessException(
                    ErrorCode.ACCESS_DENIED,
                    "댓글 삭제 권한이 없습니다."
            );
        }
        
        log.debug("댓글 삭제 실행: ID = {}, 작성자 = {}", commentId, comment.getUser().getUserId());
        commentRepository.delete(comment);
    }
    
    @Override
    public CommentResponse createReply(Long parentId, CommentCreateRequest request) {
        validateContent(request.getContent());
        UserEntity userEntity = getCurrentUserEntity();
        
        // 1. 부모 댓글 존재 확인
        CommentEntity parent = commentRepository.findById(parentId)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.COMMENT_NOT_FOUND,
                        "부모 댓글이 존재하지 않습니다. ID=" + parentId
                ));
        
        // 2. 대댓글 생성 (부모 엔티티 설정)
        // 빌더에 parent 필드가 활성화되어 있어야 합니다. (엔티티 Builder)
        CommentEntity reply = CommentEntity.builder()
                .post(parent.getPost()) // 부모 댓글이 속한 게시글을 그대로 따름
                .user(userEntity)
                .content(request.getContent())
                .parent(parent) // 부모 객체를 넣어줌
                .createdAt(LocalDateTime.now())
                .build();
        
        CommentEntity saved = commentRepository.save(reply);
        return CommentResponse.fromEntity(saved);
    }
    
    //TODO : 서큐리티 보안단 post 랑 연동해서 보안 통과한 사람만 게시물 작성 가능한 부분
    private UserEntity getCurrentUserEntity() {
        // TODO : 실제 사용자 정보 확인
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        log.debug("현재 로그인 상태 검사 : {}", principal);
        // 인증 안 된 상태면 principal이 String("anonymousUser")일 수 있음
        if (!(principal instanceof AuthenticatedUser authenticatedUser)) {
            throw new BusinessException(
                    ErrorCode.UNAUTHORIZED,
                    "인증 정보가 없습니다."
            );
        }
        log.debug("통과 여부 체크 : {}", principal);
        return authenticatedUser.user();
    }
    // TODO: 보안 설정(SecurityConfig)이 완료되기 전까지는
    //  SecurityContextHolder에 아무 값도 들어있지 않아 NullPointerException(비었음)이 발생할 수 있음.
    //  또는 로그인하지 않은 상태면 principal이  ClassCastException 에러 (타입이 다른 : UserEntity 타입이 아님)발생.

    // 만약 댓글이 비어있거나 255자를 넘었는지를 판단합니다
    private void validateContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new BusinessException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "댓글 내용은 비어 있을 수 없습니다."
            );
        }

        if (content.length() > 255) {
            throw new BusinessException(
                    ErrorCode.INVALID_INPUT_VALUE,
                    "댓글 내용은 255자를 초과할 수 없습니다."
            );
        }
    }
}
