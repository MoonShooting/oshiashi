package project.oshiashi.oshiashi.security.stmp;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerificationEntity, Long> {
    // 특정 이메일로 발급된 가장 최신의 인증 정보 하나를 가져옵니다.
    // (사용자가 여러 번 요청했을 때 마지막 번호로 인증해야 하니까요!)
    Optional<EmailVerificationEntity> findTopByEmailOrderByExpiryDateDesc(String email);

    void deleteByEmail(String email);

    // 특정 이메일로 특정 시간 이후에 생성된 데이터의 개수를 셈
    long countByEmailAndCreatedAtAfter(String email, LocalDateTime dateTime);
}
