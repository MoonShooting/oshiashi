package project.oshiashi.oshiashi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import project.oshiashi.oshiashi.domain.user.repository.UserRepository;

/**
 * [AuthenticatedUserDetailsService: 사용자 정보 조회 서비스]
 * - 역할: Spring Security의 핵심 인터페이스인 UserDetailsService를 구현하여, DB에서 사용자 정보를 가져오는 다리 역할을 함.
 * - 특징: 시큐리티는 우리 프로젝트의 DB 구조(Entity)를 모르기 때문에, 이 서비스를 통해 사용자를 조회하고 '신분증(UserDetails)' 형태로 전달받음.
 */
@Service
@RequiredArgsConstructor
public class AuthenticatedUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository; // DB 접근을 위한 저장소

	/**
	 * [loadUserByUsername: 사용자 조회 핵심 메서드]
	 * - 호출 시점: JwtAuthenticationFilter에서 토큰 검증 후, "이 유저 아이디로 상세 정보 좀 가져와!" 할 때 실행됨.
	 * - 파라미터(userId): 조회하려는 사용자의 고유 아이디.
	 */
	public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {

		// 1. DB에서 userId(Primary Key)를 기준으로 사용자 정보를 찾음
		return userRepository.findById(userId)
				/* * 2. 찾았을 경우:
				 * 우리 프로젝트의 엔티티(UserEntity)를 시큐리티 전용 규격(AuthenticatedUser)으로 포장함.
				 * .map(userEntity -> new AuthenticatedUser(userEntity)) 와 같은 의미임.
				 */
				.map(AuthenticatedUser::new)

				// 3. 못 찾았을 경우:
				// 시큐리티가 이해할 수 있는 에러인 'UsernameNotFoundException'을 던져서 가로막음.
				.orElseThrow(() -> new UsernameNotFoundException("해당 유저를 찾을 수 없습니다: " + userId));
	}
}