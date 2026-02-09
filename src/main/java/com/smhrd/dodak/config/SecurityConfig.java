package com.smhrd.dodak.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.client.RestTemplate;

import com.smhrd.dodak.service.CustomAuthSuccessHandler;

/*
 * Spring Security 의 핵심 설정 클래스
 *  springFilterChain : 모든 요청이 통과하는 필터 체인 구성
 *  인증(Authetication)과 인가(Authorization)의 흐름을 제어
 *  ☆★☆★☆★☆★☆★☆★ Controller 가 동작 하기 전, 요청이 먼저 이 필터 체인을 통과함
 *
 * */

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Autowired
	private CustomAuthSuccessHandler customAuthSuccessHandler;
    /*
     * SecurityFilterChain 등록(@Bean:Spring 보고 대신 만들고 관리해줘)
     *  - 사용자의 모든 요청을 DispatcherServlet 이전에 이 필터 체인을 먼저 거치게 됨
     *  - 내부적으로 수십 개의 Filter 가 순서대로 동작하며 인증/인가를 수행함
     *  - UsernamePasswordAuthenticationFilter 가 로그인 요청(/loginProc)을 가로채서 처리	 *  
     * */
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
		http.authorizeHttpRequests(auth ->auth
				.requestMatchers("/", "/calendar",  "/login", "/hospital/searchPopup", "/api/hospitals/*",
						         "/api/hospitals/save","/api/hospitals/all", "/api/hospitals/search",
						         "/hospital/addForm" , "/join", "/api/members/checkId", "/api/members/checkEmail",
						         "/api/members/join", "/api/members/user", "/joinProc","/addUser",
						         "/api/password/**",
						         "/css/**", "/js/**", "/img/**" , "/view/**").permitAll() // 비회원 접근 허용
				.requestMatchers("/doctor/**", "/api/members/users/**", "/api/members/assignments", "/api/analyses/monthly", "/api/diaries/detail/*").hasRole("DOCTOR") // 관리자 권한 필요한
				.requestMatchers("/member/**", "/api/members/info/*", "/api/members/update").hasAnyRole("USER","DOCTOR") // 로그인된 모든 사용자 접근 가능
				.anyRequest().authenticated() // 그외 모든 요청은 인증이 필요하다.
				)
				// [인증(Authentication) 설정 - formLogin()]
				// 	  사용자가 로그인 폼을 제출하면 Spring Security의 필터가 가로챔
				//    (Controller 가 직접 처리하지 않음)
				.formLogin(form -> form
						.loginPage("/login")               // 로그인 페이지 경로 (GET 요청 -> 우리가 만든 login.html)
						.loginProcessingUrl("/loginProc")   // 로그인 처리 경로 (POST 요청 -> Security가 자동처리)
						.successHandler(customAuthSuccessHandler)
						.failureUrl("/login?error=true")   // 로그인 실패 시 이동 설정
						.permitAll()                       // 로그인 페이지는 누구나 접근 가능
						
				)
		// [로그아웃 설정 - logout()]
		//  Security가 자동으로 세션 종료 및 인증정보 제거
		//  (Controller 필요없음)
		.logout(logout -> logout
				.logoutUrl("/logout")        // 로그아웃 요청 URL
				.logoutSuccessUrl("/")       // 로그아웃 성공 시 메인으로 이동
				.invalidateHttpSession(true) // 세션 무효화
				.clearAuthentication(true)   // 인증 정보 삭제				
		).csrf(csrf -> csrf.disable())
		;
		return http.build();
	}
    
    /*
     * PasswordEncoder Bean 등록
     * 로그인 시 입력 된 비밀번호와 DB저장 비밀번호를 비교할 때 사용
     * BCrypt는 단방향 암호화 알고리즘(복호화 불가능)
     * 회원가입 시 비밀번호를 encode() 로그인 시 matches()로 비교     * 
     * */    
    @Bean
    PasswordEncoder passwordEncoder() {
    	return new BCryptPasswordEncoder();
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
