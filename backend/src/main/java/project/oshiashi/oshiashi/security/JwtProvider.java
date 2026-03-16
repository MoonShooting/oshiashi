package project.oshiashi.oshiashi.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
/**
 * [JwtProvider: JWT 토큰 생성 및 검증 전담 클래스]
 * - 역할: 서비스 내에서 사용할 인증 토큰(JWT)의 발급, 정보 추출, 유효성 검사를 수행함.
 * - 특징: Stateless 환경에서 서버가 세션을 유지하지 않고도 사용자를 식별할 수 있게 함.
 */
@Component
public class JwtProvider {
	/*
	 * [비밀 키 및 만료 시간 설정]
	 * - secret: 토큰의 '서명(Signature)'을 만들 때 사용하는 암호화 키임.
	 * - key: JJWT 라이브러리 규격에 맞게 SecretKey 객체로 변환하여 사용함.
	 * - expirationTime: 토큰의 유효 기간 (현재 설정: 24시간).
	 */
	private final String secret = "your-very-secret-key-oshiashi-project-2024-kunoichi-anju-secret-key";
	private final SecretKey key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
	private final long expirationTime = 1000L * 60 * 60 * 24;

	/**
	 * [1. 토큰 생성: createToken]
	 * - 로그인 성공 시 호출되어 사용자의 식별 정보(userId)를 담은 토큰을 제작함.
	 * - subject: 토큰의 주인(userId)을 기록함.
	 * - issuedAt: 토큰이 언제 만들어졌는지 기록함.
	 * - expiration: 언제까지 사용할 수 있는지(유통기한)를 설정함.
	 * - signWith: 서버만 알고 있는 키로 서명하여 위조를 방지함.
	 */
	public String createToken(String userId) {
		return Jwts.builder()
				.subject(userId)
				.issuedAt(new Date())
				.expiration(new Date(System.currentTimeMillis() + expirationTime))
				.signWith(key)
				.compact();
	}
	/**
	 * [2. 정보 추출: getUserId]
	 * - 클라이언트가 보낸 토큰에서 '주인 아이디(Subject)'를 꺼내오는 기능임.
	 * - 검증이 완료된 토큰에서 Payload 영역의 데이터를 읽어옴.
	 */
	public String getUserId(String token) {
		return Jwts.parser()
				.verifyWith(key) // 서버의 키로 서명이 일치하는지 먼저 확인함
				.build()
				.parseSignedClaims(token) // 토큰을 해석함
				.getPayload()
				.getSubject(); // 담겨있던 userId 반환
	}
	/**
	 * [3. 유효성 검사: validateToken]
	 * - 토큰이 변조되었는지, 혹은 유효기간이 지났는지 확인하는 '위조 감별' 기능임.
	 * - 문제가 있다면 예외를 던지며 false를 반환함.
	 */
	public boolean validateToken(String token) {
		try {
			Jwts.parser()
					.verifyWith(key)
					.build()
					.parseSignedClaims(token);
			return true; // 아무 문제 없으면 유효함
		} catch (Exception e) {
			// 토큰 만료, 서명 불일치, 형식 오류 등 모든 경우를 포함함
			return false;
		}
	}
	/**
	 * [4. 추가: 만료 시간 추출]
	 * - 역할: 토큰의 '만료 시점'에서 '현재 시간'을 빼서 남은 수명을 계산함.
	 * - 용도: 로그아웃 시 Redis 블랙리스트의 유효기간(TTL)으로 설정하기 위함.
	 */
	public long getExpiration(String token) {
		// 1. 토큰 해석 및 검증
		Date expiration = Jwts.parser()
				.verifyWith(key)               // 서버가 가진 '비밀 키'로 서명을 확인 (위조 감별)
				.build()
				.parseSignedClaims(token)      // 토큰을 해독해서 내용을 꺼냄
				.getPayload()                  // 토큰의 알맹이(Payload)를 가져옴
				.getExpiration();              // 그 안에 적힌 '만료 시간(exp)'만 쏙 뽑아냄

		// 2. 현재 시간 가져오기
		long now = new Date().getTime();       // 현재 시간을 '밀리초(ms)' 단위로 측정

		// 3. 남은 수명 계산
		return (expiration.getTime() - now);   // (유통기한 시간 - 현재 시간) = 남은 수명
	}
}