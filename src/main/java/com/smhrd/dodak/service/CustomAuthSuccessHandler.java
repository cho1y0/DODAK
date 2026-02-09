package com.smhrd.dodak.service;

import java.io.IOException;
import java.util.Collection;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.smhrd.dodak.entity.CustomUserDetails;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CustomAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	@Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication) throws IOException, ServletException {
		log.debug("onAuthenticationSuccess start");
    	// 1. 로그인한 사용자(Authentication)의 권한(Authority) 목록을 가져옵니다.
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String targetUrl = "/"; // 기본 경로 설정 (권한이 없는 경우 또는 기본값)

        // 2. 세션에 사용자 정보(로그인 ID) 저장
        // Spring Security는 인증 성공 시 UserDetails 객체를 Principal로 사용합니다.
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof CustomUserDetails) {
        	CustomUserDetails customUserDetails = (CustomUserDetails) principal;
        	String userId = customUserDetails.getUsername(); // 로그인 ID
        	Integer memberId = customUserDetails.getMemberId(); // ⭐ Member의 PK (id) 값 추출
            log.debug("onAuthenticationSuccess userId: {}, memberId: {}", userId, memberId);
            // 세션 가져오기 또는 생성하기
            HttpSession session = request.getSession(); 
            
            // 필요한 정보를 세션에 저장 (예: 로그인 ID)
            // 세션 가져오기 또는 생성하기
            
            // 필요한 정보를 세션에 저장 (로그인 ID와 PK ID)
			session.setAttribute("userId", userId);
            session.setAttribute("memberId", memberId);       
            // TODO: 만약 memberId나 name 등 추가 정보가 필요하다면
            // CustomUserDetailsService에서 CustomUserDetails 객체를 사용하고
            // 여기서 해당 객체를 형변환하여 추가 정보를 추출해야 합니다.
            // 현재는 Spring Security의 기본 User 객체를 사용한다고 가정하고 username만 저장합니다.
        }


        // 3. 권한 목록을 순회하며 적절한 URL을 결정합니다.
        for (GrantedAuthority authority : authorities) {
            String role = authority.getAuthority();
            log.debug("role: {}", role);
            if (role.equals("ROLE_USER")) {
                // 'USER' 권한을 가진 사용자는 /member/main으로 이동
                targetUrl = "/member/main";
                break; // 이미 권한을 찾았으므로 루프를 종료합니다.
            } else if (role.equals("ROLE_DOCTOR")) {
                // 'DOCTOR' 권한을 가진 사용자는 /doctor/main으로 이동
                targetUrl = "/doctor/main";
                break;
            }
        }        
        // 4. 결정된 URL로 리다이렉트(Redirect)를 수행합니다.
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}