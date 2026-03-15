package project.oshiashi.oshiashi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.csrf(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session
						.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
				)
				.authorizeHttpRequests(auth -> auth
						// 1. 통행증 없이 허용하는 경로
						.requestMatchers("/api/v1/auth/**").permitAll()

						// [추가] 게시글/댓글 조회(GET)는 로그인을 안 해도 가능하게 설정 (선택 사항)
						.requestMatchers(HttpMethod.GET, "/api/v1/posts/**", "/api/v1/comments/**").permitAll()

						// 2. 반드시 유효한 토큰이 있어야 하는 경로
						.requestMatchers("/api/v1/user/**").authenticated()

						// [추가] 게시글/댓글 작성, 수정, 삭제(POST, PUT, DELETE 등)는 인증 필수
						.requestMatchers("/api/v1/posts/**").authenticated()
						.requestMatchers("/api/v1/comments/**").authenticated()

						// 그 외 모든 요청도 인증을 요구함
						.anyRequest().authenticated()
				)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	/**
     * [CORS 상세 설정]
     * 프론트엔드(Vite) 개발 환경 주소인 http://localhost:5173의 접근을 허용합니다.
     * 만약 프론트 포트가 변경되면 이 부분의 주소도 반드시 수정되어야 통신이 가능합니다.
	*/
	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173")); // 프론트 주소
		configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	/**
	 * [BCryptPasswordEncoder(비밀번호 암호화)]
	 * - 회원가입 시 비밀번호를 암호화하고, 로그인 시 대조하는 데 사용함.
	 * - 단방향 해시 알고리즘을 사용하여 DB가 털려도 비번을 알 수 없게 보호함.
	 */
	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}