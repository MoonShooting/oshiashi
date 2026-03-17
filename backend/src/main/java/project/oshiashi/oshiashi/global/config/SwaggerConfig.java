package project.oshiashi.oshiashi.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

	@Bean
	public OpenAPI openAPI() {
		// [추가] SecurityScheme 설정 (JWT Bearer 방식)
		String jwtSchemeName = "jwtAuth";
		SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwtSchemeName);

		Components components = new Components()
				.addSecuritySchemes(jwtSchemeName, new SecurityScheme()
						.name(jwtSchemeName)
						.type(SecurityScheme.Type.HTTP) // HTTP 방식
						.scheme("bearer")
						.bearerFormat("JWT")); // JWT임을 명시

		return new OpenAPI()
				.info(new Info()
						.title("OshiAshi API 명세서")
						.description("인증, 유저 관리 및 게시판 기능을 포함한 API 문서입니다.")
						.version("v1.0.0"))
				.addSecurityItem(securityRequirement) // [추가] 글로벌 보안 요구사항 설정
				.components(components); // [추가] 보안 컴포넌트 등록
	}
}