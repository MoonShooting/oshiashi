package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * [UserEntity: 사용자 정보 엔티티]
 * - 역할: 서비스 이용자의 계정 정보 및 상태를 관리하며, 데이터베이스 'User' 테이블과 매핑됨.
 * - 특징:
 * 1. 비밀번호, 닉네임 등 변경 가능한 필드는 전용 메서드를 통해 수정 (Setter 지양).
 * 2. 이메일과 닉네임에 유니크 제약조건을 걸어 데이터 정합성 보장.
 */
@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // JPA 규격상 기본 생성자가 필요하지만, 무분별한 객체 생성을 막기 위해 PROTECTED 설정
@AllArgsConstructor(access = AccessLevel.PRIVATE) // 빌더 패턴 내부에서 사용하기 위한 모든 필드 생성자
@Entity
@Table(
		name = "User",
		uniqueConstraints = {
				@UniqueConstraint(name = "UX_User_Email", columnNames = "email"), // DB 레벨에서 이메일 중복 방지
				@UniqueConstraint(name = "UX_User_Nickname", columnNames = "nickname") // DB 레벨에서 닉네임 중복 방지
		}
)
public class UserEntity {

	@Id
	@Column(name = "user_id", length = 50, nullable = false)
	private String userId; // 사용자가 직접 입력하는 고유 ID (PK)

	@Column(name="name", length=50, nullable = false)
	private String name; // 사용자의 실명

	@Column(name = "email", length = 255, nullable = false)
	private String email; // 고유 이메일 주소

	@Column(name = "password", length = 255, nullable = false)
	private String password; // 암호화된 비밀번호

	@Column(name = "nickname", length = 255, nullable = false)
	private String nickname; // 서비스 내 활동명 (유니크)

	@Builder.Default
	@Enumerated(EnumType.STRING) // Enum의 이름을 DB에 문자열로 저장 (숫자보다 안전함)
	@Column(name = "role", length = 50, nullable = false)
	private Role role = Role.user; // 권한 (기본값: user)

	@Builder.Default
	@Enumerated(EnumType.STRING)
	@Column(name = "status", length = 50, nullable = false)
	private UserStatus status = UserStatus.active; // 계정 상태 (기본값: active)

	@Column(name = "last_login_at")
	private LocalDateTime lastLoginAt; // 마지막 로그인 일시

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt; // 계정 생성 일시

	/** * [연관 관계: 작성한 포스트 목록]
	 * - mappedBy: PostEntity 내의 'user' 필드가 관계의 주인임을 명시함.
	 * - FetchType.LAZY: 필요할 때만 데이터를 가져오는 지연 로딩 방식을 택해 성능 최적화.
	 */
	@Builder.Default
	@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
	private List<PostEntity> posts = new ArrayList<>();

	// --- 내부 타입 정의 ---
	public enum Role { user, admin }
	public enum UserStatus { active, dormant }

	// --- 비즈니스 로직 (Setter 대신 사용) ---

	/**
	 * [비밀번호 변경]
	 * - 보안을 위해 외부에서 password 필드에 직접 접근하는 것을 막고 메서드로만 변경 허용.
	 */
	public void changePassword(String encodedPassword) {
		this.password = encodedPassword;
	}

	/**
	 * [닉네임 변경]
	 * - 마이페이지 등 정보 수정 시 호출됨.
	 */
	public void changeNickname(String nickname) {
		this.nickname = nickname;
	}

	/**
	 * [회원 상태 변경]
	 * - 탈퇴(withdrawal), 휴면(dormant) 등 상태 전환 시 사용.
	 */
	public void changeStatus(UserStatus status) {
		this.status = status;
	}

	/**
	 * [최근 로그인 시간 갱신]
	 * - 로그인 성공 시마다 현재 시간으로 업데이트.
	 */
	public void updateLastLogin() {
		this.lastLoginAt = LocalDateTime.now();
	}
}