package project.oshiashi.oshiashi.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
/**
 * 프로젝트에서 사용하는 공통 에러 코드를 관리하는 enum
 *
 * - HTTP 상태값(status)
 * - 프론트에 내려줄 에러 코드(code)
 * - 기본 에러 메시지(message)
 *
 * 를 한 곳에서 관리한다.
 *
 * 예외 발생 시 BusinessException과 함께 사용된다.
 */
@Getter
public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "COMMON_400", "잘못된 요청입니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "COMMON_405", "허용되지 않은 HTTP 메서드입니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMON_404", "대상을 찾을 수 없습니다."),
    DUPLICATE_RESOURCE(HttpStatus.CONFLICT, "COMMON_409", "이미 존재하는 데이터입니다."),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "COMMON_401", "인증이 필요합니다."),
    ACCESS_DENIED(HttpStatus.FORBIDDEN, "COMMON_403", "접근 권한이 없습니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "COMMON_500", "서버 내부 오류가 발생했습니다."),

    // Post
    POST_NOT_FOUND(HttpStatus.NOT_FOUND, "POST_404", "게시글을 찾을 수 없습니다."),

    // Comment
    COMMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "COMMENT_404", "댓글을 찾을 수 없습니다."),

    // Route
    ROUTE_NOT_FOUND(HttpStatus.NOT_FOUND, "ROUTE_404", "루트를 찾을 수 없습니다."),

    // Bookmark
    BOOKMARK_TARGET_INVALID(HttpStatus.BAD_REQUEST, "BOOKMARK_400", "북마크 대상은 하나만 선택해야 합니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    ErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}