package project.oshiashi.oshiashi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling // 스케쥴러 삽입 어노테이션
@SpringBootApplication
public class OshiashiApplication {

	public static void main(String[] args) {
		SpringApplication.run(OshiashiApplication.class, args);
	}

}
