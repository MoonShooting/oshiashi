package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@AllArgsConstructor
@Builder
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
    private Role role = Role.user; // 디폴트 값 user로 설정

	@Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false) // 디폴트 엑티브 체크
    private UserStatus status = UserStatus.active; // 디폴트 값 active로 설정

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

/**
 @Builder.Default
  - Lombok빌더 사용 시,필드에 선언된 초기값(new ArrayList<>())을 유지함.
 - 미설정 시 빌더가 이 리스트를 nul로 만들어 에러(NullPointerException)를 유발함.
 */
	@Builder.Default
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<PostEntity> posts = new ArrayList<>();


    public enum Role {user, admin}

    public enum UserStatus {active, dormant}
}