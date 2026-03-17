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

	// [수정] 자바 필드는 authCode이지만, DB 컬럼은 auth_code임을 명시
	@Column(name = "auth_code", nullable = false)
	private String authCode;

	// [유지] 기존에 잘 매핑되어 있던 부분
	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	// [수정] 자바 필드는 expiryDate이지만, DB 컬럼은 expiry_date임을 명시
	@Column(name = "expiry_date", nullable = false)
	private LocalDateTime expiryDate;

	// [수정] 자바 필드는 isVerified이지만, DB 컬럼은 is_verified임을 명시
	@Column(name = "is_verified")
	@Builder.Default
	private boolean isVerified = false;

	/**
	 * [JPA Lifecycle Callback]
	 * 저장 직전에 실행되어 null 값을 방지하고 기본 시간을 설정합니다.
	 */
	@PrePersist
	public void prePersist() {
		// 1. 생성 시간 자동 설정
		if (this.createdAt == null) {
			this.createdAt = LocalDateTime.now();
		}
		// 2. 만료 시간 자동 설정 (null일 경우 5분 뒤로)
		if (this.expiryDate == null) {
			this.expiryDate = LocalDateTime.now().plusMinutes(5);
		}
	}
	// 비즈니스 로직: 인증 완료 처리
	public void markAsVerified() {
		this.isVerified = true;
	}
	// 만료 여부 확인 로직
	public boolean isExpired() {
		return LocalDateTime.now().isAfter(this.expiryDate);
	}
}