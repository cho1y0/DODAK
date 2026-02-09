package com.smhrd.dodak.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${mail.sender.alias:noreply@dodak.com}")
    private String senderAlias;

    /**
     * 임시 비밀번호 이메일 발송
     * @param toEmail 수신자 이메일
     * @param userName 사용자 이름
     * @param userId 사용자 아이디
     * @param tempPassword 임시 비밀번호
     */
    public void sendTempPasswordEmail(String toEmail, String userName, String userId, String tempPassword) {
        String subject = "[DODAK] 임시 비밀번호 안내";

        String content = buildTempPasswordEmailContent(userName, userId, tempPassword);

        sendHtmlEmail(toEmail, subject, content);
    }

    /**
     * HTML 이메일 발송
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderAlias);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }

    /**
     * 임시 비밀번호 이메일 HTML 템플릿
     */
    private String buildTempPasswordEmailContent(String userName, String userId, String tempPassword) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Noto Sans KR', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #8d6e63, #a1887f); color: white; padding: 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px; }
                    .info-box { background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .password-box { background-color: #e3f2fd; border: 2px dashed #2196f3; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
                    .password { font-size: 28px; font-weight: bold; color: #1565c0; letter-spacing: 2px; font-family: monospace; }
                    .warning { color: #d32f2f; font-size: 14px; margin-top: 20px; }
                    .footer { background-color: #f5f5f5; padding: 20px; text-align: center; color: #757575; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>DODAK 임시 비밀번호 안내</h1>
                    </div>
                    <div class="content">
                        <p>안녕하세요, <strong>%s</strong>님!</p>
                        <p>요청하신 임시 비밀번호를 안내해 드립니다.</p>

                        <div class="info-box">
                            <strong>아이디:</strong> %s
                        </div>

                        <div class="password-box">
                            <p style="margin: 0 0 10px 0; color: #666;">임시 비밀번호</p>
                            <span class="password">%s</span>
                        </div>

                        <p class="warning">
                            * 보안을 위해 로그인 후 반드시 비밀번호를 변경해 주세요.<br>
                            * 본 메일은 발신 전용이며, 회신되지 않습니다.
                        </p>
                    </div>
                    <div class="footer">
                        <p>DODAK - 당신의 마음을 돌보는 서비스</p>
                        <p>본 메일은 비밀번호 찾기 요청에 의해 자동 발송되었습니다.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, userId, tempPassword);
    }
}
