package project.oshiashi.oshiashi.global.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
public class RedisConfig {
    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        /**
         * StringRedisTemplate은 Key와 Value 모두 문자열(String)로 저장할 때 최적화된 도구입니다.
         * [이메일 인증번호로 쓸 6자리의 타입이 String인 이유]
         * 1. 앞자리 0을 보존하기 위해서.
         * 2. 식별용 코드(전화번호, 우편번호, 주민번호 등)를 계산할 일이 없기 때문에 프로그래밍 관점에서 String 값 사용.
         * 3. 나중에 영어 숫자 등 기준이 바뀌어도 난수 로직이 바뀌는 것일 뿐 값의 타입은 그대로 사용할 수 있기 때문.
         */
        return new StringRedisTemplate(connectionFactory);
    }
}
