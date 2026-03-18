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

		// 현재 어떤 요청이 들어왔는지 확인하기 위한 로그 (디버깅용)
		log.debug("[Security Filter] 요청 감지: {} {}", request.getMethod(), request.getRequestURI());
		// 1. HTTP 요청 헤더에서 "Authorization" 값을 꺼내옴
		String authHeader = request.getHeader("Authorization");
		// [1-1] Front에서 header값을 유저정보를 담아 잘 가져오는지 확인용 디버그
		log.debug("[Security Filter] 수신된 헤더: {}", authHeader);
		// 2. 토큰 존재 여부 및 "Bearer " 표준 규격 확인
		// - Bearer: "이 토큰의 소지자(Bearer)에게 권한을 주라"는 약속된 인증 타입임.
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
			// "Bearer " 이후의 실제 토큰 문자열만 추출 (인덱스 7번부터 끝까지)
			String token = authHeader.substring(7);
			// 3. [보안 추가] 블랙리스트 확인 (로그아웃 여부)
			// - 유효한 토큰이라도 사용자가 로그아웃을 했다면 Redis에 등록되어 접근이 차단되어야 함.
			if (isBlacklisted(token)) {
				log.warn("[Security] 로그아웃된 토큰으로 접근 시도 차단: {}", token);
				// 블랙리스트일 경우 인증 도장을 찍지 않고 다음 필터로 넘김 (결국 권한 부족으로 차단됨)
				filterChain.doFilter(request, response);
				return;
			}
			// 4. JWT 토큰의 유효성 검증 (위조, 변조, 만료 시간 체크)
			if (jwtProvider.validateToken(token)) {

				// 5. 토큰에서 사용자 식별자(userId)를 꺼내옴
				String userId = jwtProvider.getUserId(token);

				// 6. DB에서 유저 정보를 조회하여 시큐리티 전용 신분증(UserDetails) 객체 생성
				UserDetails userDetails = userDetailsService.loadUserByUsername(userId);

				// 7. 시큐리티 전용 '인증 도장(Authentication 객체)'을 만듦
				// - 첫 번째 인자: 유저 정보 (Principal)
				// - 두 번째 인자: 비밀번호 (이미 토큰으로 인증됐으므로 null)
				// - 세 번째 인자: 해당 유저의 권한 목록 (Authorities)
				UsernamePasswordAuthenticationToken authentication =
						new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

				// 8. [핵심] 시큐리티 저장소(SecurityContext)에 인증 도장을 쾅 찍어줌
				// - 이 작업이 완료되어야 이후 로직(Controller 등)에서 "인증된 사용자"로 인정받음.
				SecurityContextHolder.getContext().setAuthentication(authentication);
				log.debug("[Security] 유저 인증 성공!: {}", userId);
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