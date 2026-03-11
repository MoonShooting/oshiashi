package project.oshiashi.oshiashi.security.stmp;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "email_verifications")
public class EmailVerificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String authCode;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Builder.Default // 빌더 사용 시에도 기본값 유지
    private boolean isVerified = false;

    // 비즈니스 로직: 인증 완료 처리
    public void markAsVerified() {
        this.isVerified = true;
    }

    // 만료 여부 확인 로직 (서비스 단에서 써도 되고 엔티티에 둬도 됩니다)
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryDate);
    }
}
