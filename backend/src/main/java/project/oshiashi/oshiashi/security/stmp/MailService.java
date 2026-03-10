package project.oshiashi.oshiashi.security.stmp;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    /**
     * 인증번호 이메일 발송
     * Async: 메일 발송은 네트워크 지연이 발생할 수 있으므로 비동기로 처리하여
     * 사용자가 기다리지 않게 함.
     */
    @Async
    public void sendVerificationEmail(String toEmail, String authCode) {
        log.info("[Mail Service] 메일 발송 프로세스 시작 (Async) - To: {}", toEmail);
        // 로고 URL (GitHub나 외부 호스팅 이미지 주소로 교체하세요)
        String logoUrl = ""; //로고 url
        String brandColor = ""; // 오시아시의 퍼플 포인트 컬러

        String title = "[Oshiashi] 회원가입 인증번호 안내";

        // 이메일 본문 (인라인 스타일 적용)
        String content =
                "<div style='max-width: 500px; margin: 20px auto; font-family: \"Pretendard\", sans-serif; border: 1px solid #efefef; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);'>" +
                        // 상단 로고 배경
                        "<div style='background-color: " + brandColor + "; padding: 30px; text-align: center;'>" +
                        "<img src='" + logoUrl + "' alt='Oshiashi Logo' style='width: 120px; height: auto;'>" +
                        "</div>" +
                        // 메일 내용
                        "<div style='padding: 40px 20px; text-align: center; background-color: #ffffff;'>" +
                        "<h2 style='color: #333; margin-bottom: 10px;'>이메일 인증을 진행해 주세요</h2>" +
                        "<p style='color: #666; font-size: 14px; line-height: 1.6;'>안녕하세요! 콘텐츠 속 성지순례 플랫폼 <b>오시아시</b>입니다.<br>" +
                        "회원가입 완료를 위해 아래 인증번호를 입력창에 기입해 주세요.</p>" +
                        // 인증번호 강조 박스
                        "<div style='margin: 30px 0; padding: 20px; background-color: #f8f3fc; border-radius: 10px; border: 1px dashed " + brandColor + ";'>" +
                        "<span style='font-size: 32px; font-weight: bold; color: " + brandColor + "; letter-spacing: 8px;'>" + authCode + "</span>" +
                        "</div>" +
                        "<p style='color: #999; font-size: 12px;'>인증번호 유효 시간: <b>3분</b></p>" +
                        "</div>" +
                        // 하단 안내
                        "<div style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;'>" +
                        "<p style='font-size: 11px; color: #bbb; margin: 0;'>본 메일은 발신 전용입니다.</p>" +
                        "<p style='font-size: 11px; color: #bbb; margin: 5px 0 0;'>© 2026 Oshiashi Team. All rights reserved.</p>" +
                        "</div>" +
                        "</div>";

        sendMail(toEmail, title, content);
    }

    /**
     * 공통 메일 발송 로직
     */
    private void sendMail(String toEmail, String title, String content) {
        MimeMessage message = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject(title);
            helper.setText(content, true); // true: HTML 형식 사용 설정

            mailSender.send(message);
            log.info("[Mail Service] SMTP 서버로 메일 전송 성공 - To: {}", toEmail);
        } catch (MessagingException e) {
            // 발송 실패 시 런타임 예외를 던져 상위에서 처리하거나 로그 기록
            log.error("[Mail Service] SMTP 전송 에러 발생: {}", e.getMessage());
            throw new RuntimeException("이메일 발송 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
}
