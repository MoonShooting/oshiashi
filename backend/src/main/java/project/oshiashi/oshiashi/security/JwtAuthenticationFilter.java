package project.oshiashi.oshiashi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * [JwtAuthenticationFilter: JWT 전용 보안 필터]
 * - 역할: 모든 HTTP 요청의 헤더를 검사하여 유효한 JWT 토큰이 있는지 확인하고 사용자 인증을 수행함.
 * - 특징:
 * 1. OncePerRequestFilter를 상속받아 한 요청당 딱 한 번만 실행됨을 보장함.
 * 2. 세션을 사용하지 않는 Stateless 환경의 핵심 관문임.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtProvider jwtProvider; // 토큰의 위조/만료 여부 검증 및 정보 추출 담당
	private final AuthenticatedUserDetailsService userDetailsService; // DB에서 유저 정보를 가져와 신분증(UserDetails) 제작
	private final StringRedisTemplate redisTemplate; // [중요] 로그아웃된 토큰(Blacklist)인지 확인하기 위한 저장소

	/**
	 * [필터 핵심 로직: doFilterInternal]
	 * - 사용자의 요청이 Controller에 닿기 전, 시큐리티 필터 체인에서 가로채어 검문을 실시함.
	 */
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// 1. HTTP 요청 헤더에서 "Authorization" 값을 꺼내옴
		String authHeader = request.getHeader("Authorization");

		// 2. 토큰 존재 여부 및 "Bearer " 표준 규격 확인
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			String token = authHeader.substring(7);

			// 3. 블랙리스트(로그아웃) 확인
			if (isBlacklisted(token)) {
				log.warn("[Security] 로그아웃된 토큰으로 접근 시도 차단");
				filterChain.doFilter(request, response);
				return;
			}

			// 4. JWT 검증 + userId 추출을 한 번의 파싱으로 처리 (이전: validateToken + getUserId 두 번 파싱)
			String userId = jwtProvider.getUserIdIfValid(token);
			if (userId != null) {
				// 5. DB에서 유저 정보 조회 (role 등 추가 정보 필요)
				UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

				// 6. SecurityContext에 인증 도장 등록
				UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		}
		// 9. 검문이 끝났으면 다음 필터로 요청을 넘겨줌 (혹은 최종 목적지인 Controller로 도달함)
		filterChain.doFilter(request, response);
	}
	/**
	 * [내부 유틸리티: 블랙리스트 체크]
	 * - Redis에 "blacklist:토큰값" 형태의 키가 존재하는지 확인함.
	 */
	private boolean isBlacklisted(String token) {
		// redisTemplate.hasKey는 해당 키가 존재하면 true를 반환함
		return Boolean.TRUE.equals(redisTemplate.hasKey("blacklist:" + token));
	}
}