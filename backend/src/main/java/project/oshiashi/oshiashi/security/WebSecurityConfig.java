package project.oshiashi.oshiashi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * [WebSecurityConfig: 보안 총괄 설정]
 * 1. CSRF 비활성화: REST API는 세션을 쓰지 않고 토큰(JWT)을 쓰므로 쿠키 기반 공격인 CSRF에서 안전함.
 * 2. 무상태(Stateless): 서버가 사용자의 상태(세션)를 저장하지 않고 오직 토큰으로만 소통함.
 * 3. 경로 제어: 설계서에 따라 /api/v1/auth는 모두 허용, /api/v1/user는 인증 필수.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				// REST API 환경에 최적화된 설정 (무상태성 유지)
				.csrf(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				// 세션 정책: 서버에 세션을 절대 생성하지 않음 (JWT 방식의 핵심)
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				)
				// URL별 접근 권한 설정 (설계서 v1 기준)
				.authorizeHttpRequests(auth -> auth
						// 회원가입, 로그인, 중복확인 등은 통행증 없이도 가능
						.requestMatchers("/api/v1/auth/**").permitAll()
						// 마이페이지, 프로필 수정 등은 반드시 유효한 토큰이 있어야 함
						.requestMatchers("/api/v1/user/**").authenticated()
						// 그 외 모든 요청도 일단은 인증을 요구함
						.anyRequest().authenticated()
				)
				// [핵심] JWT 검문소를 시큐리티 기본 필터 앞에 배치함
				// 사용자가 보낸 토큰을 먼저 확인해서 인증을 마쳐야 뒤의 요청이 정상 처리됨.
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
	/**
	 * [BCryptPasswordEncoder]
	 * - 회원가입 시 비밀번호를 암호화하고, 로그인 시 대조하는 데 사용함.
	 * - 단방향 해시 알고리즘을 사용하여 DB가 털려도 비번을 알 수 없게 보호함.
	 */
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}