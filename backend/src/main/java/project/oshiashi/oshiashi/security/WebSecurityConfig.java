package project.oshiashi.oshiashi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
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
						// 1. 테스트 페이지 및 메인 경로 허용 (추가된 부분)
						.requestMatchers("/", "/home", "/home.html", "/api/v1/auth/**").permitAll()
						// 2. 인증 없이 접근 가능한 API 경로
						.requestMatchers("/api/v1/auth/**").permitAll()
						// 3. 게시글/댓글 조회(GET)는 비로그인 사용자도 가능
						.requestMatchers(HttpMethod.GET, "/api/v1/posts/**", "/api/v1/comments/**").permitAll()
						// 4. 반드시 유효한 토큰이 있어야 하는 경로 (마이페이지 등)
						.requestMatchers("/api/v1/user/**").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/v1/posts/**", "/api/v1/comments/**").authenticated()
						.requestMatchers(HttpMethod.PATCH, "/api/v1/posts/**", "/api/v1/comments/**").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/v1/posts/**", "/api/v1/comments/**").authenticated()
						// 그 외 모든 요청 인증 요구
						.anyRequest().authenticated()
				)
				// JWT 필터를 시큐리티 필터 체인에 등록
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	/**
	 * [정적 리소스 보안 예외 설정]
	 * CSS, JS, 이미지 파일 등이 시큐리티 로직을 타지 않도록 완전 개방합니다.
	 */
	@Bean
	public WebSecurityCustomizer webSecurityCustomizer() {
		return (web) -> web.ignoring()
				.requestMatchers(PathRequest.toStaticResources().atCommonLocations());
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(java.util.Arrays.asList("http://localhost:5173"));
		configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public BCryptPasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}