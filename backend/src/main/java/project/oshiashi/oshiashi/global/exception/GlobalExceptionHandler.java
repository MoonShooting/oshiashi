package project.oshiashi.oshiashi.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

/**
 * 프로젝트 전역 예외 처리 클래스
 *
 * 컨트롤러 / 서비스에서 발생한 예외를 한 곳에서 처리하여
 * 일관된 형태의 ErrorResponse로 반환한다.
 *
 * 처리 대상 예:
 * - BusinessException
 * - Validation 예외
 * - 잘못된 HTTP 메서드 요청
 * - 접근 권한 예외
 * - 기타 서버 내부 예외
 */

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(
            BusinessException e,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = e.getErrorCode();

        return ResponseEntity.status(errorCode.getStatus())
                .body(build(errorCode, e.getMessage(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException e,
            HttpServletRequest request
    ) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getDefaultMessage())
                .orElse(ErrorCode.INVALID_INPUT_VALUE.getMessage());

        return ResponseEntity.status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(build(ErrorCode.INVALID_INPUT_VALUE, message, request.getRequestURI()));
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(
            BindException e,
            HttpServletRequest request
    ) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fieldError -> fieldError.getDefaultMessage())
                .orElse(ErrorCode.INVALID_INPUT_VALUE.getMessage());

        return ResponseEntity.status(ErrorCode.INVALID_INPUT_VALUE.getStatus())
                .body(build(ErrorCode.INVALID_INPUT_VALUE, message, request.getRequestURI()));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotAllowed(
            HttpRequestMethodNotSupportedException e,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(ErrorCode.METHOD_NOT_ALLOWED.getStatus())
                .body(build(ErrorCode.METHOD_NOT_ALLOWED,
                        ErrorCode.METHOD_NOT_ALLOWED.getMessage(),
                        request.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException e,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(ErrorCode.ACCESS_DENIED.getStatus())
                .body(build(ErrorCode.ACCESS_DENIED,
                        ErrorCode.ACCESS_DENIED.getMessage(),
                        request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception e,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getStatus())
                .body(build(ErrorCode.INTERNAL_SERVER_ERROR,
                        ErrorCode.INTERNAL_SERVER_ERROR.getMessage(),
                        request.getRequestURI()));
    }

    private ErrorResponse build(ErrorCode errorCode, String message, String path) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(errorCode.getStatus().value())
                .code(errorCode.getCode())
                .message(message)
                .path(path)
                .build();
    }
}