package project.oshiashi.oshiashi.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import project.oshiashi.oshiashi.domain.user.entity.UserEntity;
import java.util.Collection;
import java.util.Collections;

/**
 * [AuthenticatedUser: 시큐리티 전용 사용자 신분증]
 * - 역할: 우리 서비스의 유저 엔티티(UserEntity)를 Spring Security가 이해할 수 있는 'UserDetails' 규격으로 포장함.
 * - 특징: Java의 'record'를 사용하여 불변(Immutable) 객체로 만들었으며, 인증 과정에서 유저의 비밀번호와 권한 정보를 제공함.
 */
public record AuthenticatedUser(UserEntity user) implements UserDetails {

	/**
	 * [getAuthorities: 사용자 권한 반환]
	 * - 유저가 가진 권한(Role)을 시큐리티가 인식할 수 있는 형태로 변환함.
	 * - 예: DB에 "USER"라고 저장되어 있다면, 시큐리티 관례에 따라 "ROLE_USER"로 반환함.
	 */
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// 단일 권한을 리스트에 담아 반환 (ROLE_ 접두사는 시큐리티 권한 체크의 기본 규칙임)
		return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
	}

	/**
	 * [getPassword: 암호화된 비밀번호 제공]
	 * - 인증 과정에서 입력받은 비번과 대조하기 위해 DB에 저장된 해시된 비번을 넘겨줌.
	 */
	@Override
	public String getPassword() {
		return user.getPassword();
	}

	/**
	 * [getUsername: 사용자 식별자 제공]
	 * - 유저를 고유하게 식별할 수 있는 아이디를 넘겨줌.
	 */
	@Override
	public String getUsername() {
		return user.getUserId();
	}

	/* ---------------------------------------------------------
	 * [계정 상태 체크 메서드들]
	 * 서비스 정책에 따라 계정 잠금, 만료 여부 등을 제어할 수 있음.
	 * 현재는 특별한 제한이 없으므로 모두 true(사용 가능)를 반환함.
	 * --------------------------------------------------------- */

	// 계정 만료 여부 (true: 만료 안 됨)
	@Override public boolean isAccountNonExpired() { return true; }

	// 계정 잠금 여부 (true: 잠기지 않음)
	@Override public boolean isAccountNonLocked() { return true; }

	// 비밀번호(자격 증명) 만료 여부 (true: 만료 안 됨)
	@Override public boolean isCredentialsNonExpired() { return true; }

	// 계정 활성화 여부 (true: 활성화됨)
	@Override public boolean isEnabled() { return true; }
}