package project.oshiashi.oshiashi.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
	@Value("${board.uploadPath}")
	private String uploadPath;
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		// 브라우저가 /uploads/** 로 들어오면
		// 로컬 폴더 c:/MyProject/util/uploads/ 에서 찾아라!
		registry.addResourceHandler("/uploads/**")
				.addResourceLocations("file:///" + uploadPath + "/");
	}
}
