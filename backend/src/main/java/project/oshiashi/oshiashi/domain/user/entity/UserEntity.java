package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 빌더 패턴 사용을 위한 전용 생성자 생성함
@AllArgsConstructor(access = AccessLevel.PRIVATE) // JPA 기본 생성자 접근을 제한해 객체 생성 규칙 보호함
@Entity
@Table(
        name = "User",
        uniqueConstraints = {
                @UniqueConstraint(name = "UX_User_Email", columnNames = "email"),
                @UniqueConstraint(name = "UX_User_Nickname", columnNames = "nickname")
        }
)
public class UserEntity {

    @Id
    @Column(name = "user_id", length = 50, nullable = false)
    private String userId;

	@Column(name="name", length=50, nullable = false)
	private String name;

    // 유니크
    @Column(name = "email", length = 255, nullable = false)
    private String email;

    @Column(name = "password", length = 255, nullable = false)
    private String password;

    // 유니크
    // 설계서에는 NOT NULL 없음. 일단 false로 해둠
    @Column(name = "nickname", length = 255, nullable = false)
    private String nickname;

	@Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50, nullable = false) // 디폴트
    private Role role = Role.user;

	@Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false) // 디폴트 엑티브 체크
    private UserStatus status = UserStatus.active;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

	/** * 작성한 포스트 목록
	 * - @Builder.Default: 빌더 패턴으로 객체 생성 시 빈 리스트 초기화 보장
	 * - FetchType.LAZY: 실제 데이터가 필요한 시점에 조회하는 지연 로딩 적용
	 */
	@Builder.Default
	@OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
	private List<PostEntity> posts = new ArrayList<>();

    public enum Role {user, admin}

    public enum UserStatus {active, dormant}

	/**
	 * [비밀번호 변경] -> 위의 User 선언들이 대부분 readonly이기 때문에 매서드 추가
	 * - 엔티티의 불변성을 유지하기 위해 Setter 대신 명확한 의미의 메서드를 사용.
	 */
	public void changePassword(String encodedPassword) {
		this.password = encodedPassword;
	}

	/**
	 * [회원 상태 변경] -> 위의 User 선언들이 대부분 readonly이기 때문에 매서드 추가
	 * - 탈퇴나 휴면 상태 전환 시 사용.
	 */
	public void changeStatus(UserStatus status) {
		this.status = status;
	}
}