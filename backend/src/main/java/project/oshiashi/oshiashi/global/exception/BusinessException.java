package project.oshiashi.oshiashi.global.exception;

// throw new BusinessException(ErrorCode.RESOURCE_NOT_FOUND); <- 여기 이 코드를 서비스에다가 사용하면 됩니다.

/**
 * 서비스 계층에서 사용하는 공통 비즈니스 예외 클래스
 *
 * ErrorCode를 함께 담아서 예외를 발생시키며,
 * GlobalExceptionHandler가 이 예외를 받아
 * 공통 형식의 에러 응답으로 변환한다.
 *
 * 도메인별 커스텀 예외의 부모 클래스로도 사용할 수 있다.
 */
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public BusinessException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}