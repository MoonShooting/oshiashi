package project.oshiashi.oshiashi.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**") // 모든 API 경로에 대해
				.allowedOrigins("http://localhost:5173", "http://localhost:3000") // 프론트엔드 개발 서버 주소
				.allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true); // 쿠키나 인증 정보를 포함할 경우 필수
	}
}