package project.oshiashi.oshiashi.global.exception;

/**
 * 예외 발생 시 클라이언트(프론트엔드)에게 내려주는
 * 공통 에러 응답 DTO
 *
 * 포함 정보:
 * - timestamp : 예외 발생 시각
 * - status    : HTTP 상태 코드
 * - code      : 정의한 에러 코드
 * - message   : 에러 메시지
 * - path      : 요청 URL 경로
 */

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private String path;
}