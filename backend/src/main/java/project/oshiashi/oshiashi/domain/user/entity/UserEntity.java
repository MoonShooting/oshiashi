package project.oshiashi.oshiashi.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;
import project.oshiashi.oshiashi.domain.post.entity.PostEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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
    @Column(name = "user_id", length = 50)
    private String userId;

    @Column(name = "email", length = 225, nullable = false)
    private String email;

    @Column(name = "password", length = 225, nullable = false)
    private String password;

    @Column(name = "nickname", length = 225, nullable = false)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", length = 50, nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private UserStatus status;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user")
    private List<PostEntity> posts = new ArrayList<>();


    public enum Role {user, admin}

    public enum UserStatus {active, dormant}
}