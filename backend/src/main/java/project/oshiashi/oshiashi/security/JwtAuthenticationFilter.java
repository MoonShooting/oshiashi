package project.oshiashi.oshiashi.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * [JwtAuthenticationFilter: JWT 전용 검문소 필터]
 * - 역할: 모든 요청(OncePerRequest)에 대해 헤더에 담긴 JWT 토큰을 확인하고 사용자를 인증함.
 * - 특징: 세션을 사용하지 않기 때문에, 매 요청마다 이 필터에서 토큰 검사를 수행하여 "누가 보낸 요청인지" 확인함.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final JwtProvider jwtProvider; // 토큰 해독기
	private final AuthenticatedUserDetailsService userDetailsService; // DB 유저 확인 도우미

	/**
	 * [필터 핵심 로직: doFilterInternal]
	 * 사용자의 요청이 Controller에 닿기 전, 시큐리티 필터 체인에서 가로채어 토큰을 검사함.
	 */
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// 1. HTTP 요청 헤더에서 "Authorization" 값을 꺼내옴
		String authHeader = request.getHeader("Authorization");

		// 2. 토큰 존재 여부 및 "Bearer "로 시작하는지 확인 (JWT 관례)
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			// "Bearer " 이후의 실제 토큰 문자열만 추출 (7번째 인덱스부터 끝까지)
			String token = authHeader.substring(7);

			// 3. 추출한 토큰이 변조되지 않았고 유효기간이 남았는지 검증
			if (jwtProvider.validateToken(token)) {
				// 4. 토큰에서 사용자 아이디(userId)를 꺼내옴
				String userId = jwtProvider.getUserId(token);

				// 5. DB에서 해당 아이디의 유저 정보를 조회함 (UserDetails 객체 생성)
				UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

				// 6. 시큐리티 전용 '인증 도장(Authentication 객체)'을 만듦
				UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

				// 7. [핵심] 시큐리티 저장소(SecurityContext)에 인증 도장을 쾅 찍어줌
				// 이 작업이 완료되어야 이후 로직(Controller 등)에서 "인증된 사용자"로 인정받음.
				SecurityContextHolder.getContext().setAuthentication(authentication);
			}
		}
		// 8. 검문이 끝났으면 다음 필터로 요청을 넘겨줌 (혹은 Controller로 도달함)
		filterChain.doFilter(request, response);
	}
}