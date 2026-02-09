package com.smhrd.dodak.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.dodak.service.PasswordResetService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @Data
    public static class PasswordResetRequest {
        private String userId;
        private String email;
    }

    @Data
    public static class PasswordResetResponse {
        private boolean success;
        private String message;

        public PasswordResetResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    /**
     * 비밀번호 찾기 - 임시 비밀번호 발송
     */
    @PostMapping("/reset")
    public ResponseEntity<PasswordResetResponse> resetPassword(@RequestBody PasswordResetRequest request) {
        log.info("Password reset request - userId: {}, email: {}", request.getUserId(), request.getEmail());

        // 입력값 검증
        if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new PasswordResetResponse(false, "아이디를 입력해주세요."));
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new PasswordResetResponse(false, "이메일을 입력해주세요."));
        }

        try {
            boolean result = passwordResetService.resetPassword(
                    request.getUserId().trim(),
                    request.getEmail().trim()
            );

            if (result) {
                return ResponseEntity.ok(new PasswordResetResponse(true,
                        "임시 비밀번호가 이메일로 발송되었습니다."));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new PasswordResetResponse(false,
                                "입력하신 정보와 일치하는 회원이 없습니다."));
            }
        } catch (RuntimeException e) {
            log.error("Password reset error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PasswordResetResponse(false, e.getMessage()));
        }
    }
}
