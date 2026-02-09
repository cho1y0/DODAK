package com.smhrd.dodak.service;

import java.security.SecureRandom;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final MemberRepository memberRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final String CHAR_LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String CHAR_UPPER = CHAR_LOWER.toUpperCase();
    private static final String DIGIT = "0123456789";
    private static final String SPECIAL = "!@#$%&*";
    private static final String PASSWORD_ALLOW = CHAR_LOWER + CHAR_UPPER + DIGIT + SPECIAL;
    private static final SecureRandom random = new SecureRandom();

    /**
     * 비밀번호 찾기: 임시 비밀번호 생성 및 이메일 발송
     * @param userId 사용자 아이디
     * @param email 사용자 이메일
     * @return 성공 여부
     */
    @Transactional
    public boolean resetPassword(String userId, String email) {
        // 1. 아이디와 이메일로 회원 조회
        Member member = memberRepository.findByUserIdAndEmail(userId, email)
                .orElse(null);

        if (member == null) {
            log.warn("Password reset failed - member not found: userId={}, email={}", userId, email);
            return false;
        }

        // 2. 임시 비밀번호 생성 (12자리)
        String tempPassword = generateTempPassword(12);

        // 3. 비밀번호 암호화 후 저장
        member.setPassword(passwordEncoder.encode(tempPassword));
        memberRepository.save(member);

        log.info("Password reset successful for user: {}", userId);

        // 4. 이메일 발송
        try {
            emailService.sendTempPasswordEmail(
                member.getEmail(),
                member.getName(),
                member.getUserId(),
                tempPassword
            );
            return true;
        } catch (Exception e) {
            log.error("Failed to send temp password email to user: {}", userId, e);
            throw new RuntimeException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 임시 비밀번호 생성
     * @param length 비밀번호 길이
     * @return 생성된 임시 비밀번호
     */
    private String generateTempPassword(int length) {
        StringBuilder sb = new StringBuilder(length);

        // 최소 1개씩 포함 보장
        sb.append(CHAR_LOWER.charAt(random.nextInt(CHAR_LOWER.length())));
        sb.append(CHAR_UPPER.charAt(random.nextInt(CHAR_UPPER.length())));
        sb.append(DIGIT.charAt(random.nextInt(DIGIT.length())));
        sb.append(SPECIAL.charAt(random.nextInt(SPECIAL.length())));

        // 나머지 자리 랜덤 채우기
        for (int i = 4; i < length; i++) {
            sb.append(PASSWORD_ALLOW.charAt(random.nextInt(PASSWORD_ALLOW.length())));
        }

        // 문자열 섞기
        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        return new String(chars);
    }
}
