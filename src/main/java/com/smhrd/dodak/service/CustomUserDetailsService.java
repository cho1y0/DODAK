package com.smhrd.dodak.service;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.smhrd.dodak.entity.CustomUserDetails;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * CustomUserDetailsService
 * Security의 인증 과정에서 DB를 통해 사용자를 검증하는 핵심 클래스
 * 사용자가 로그인 폼에서 입력한 ID(username)를 받아 DB에서 해당 회원을 찾음
 * 찾은 회원 정보를 Spring Security 전용 User객체(UserDetails)로 변환하여 반환
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
	private final MemberRepository memberRepository;

	/*
	 * Security가 로그인 시 호출하는 메서드 - username : 로그인 form에서 입력한 name="username" 값 -
	 * Security 내부에서 자동으로 호출됨(Controller에서 호출하지 않음)
	 * 
	 */

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		log.debug("loadUserByUsername - username: {}", username);

		Optional<Member> optionalMember = memberRepository.findByUserId(username);

		Member member = optionalMember.orElseThrow(
				() -> new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다: " + username));

		log.debug("loadUserByUsername completed for user: {}", username);
		return new CustomUserDetails(member);

//		MemberVO member = memberRepository.findAll()
//				.stream()
//				.filter(m -> m.getClass().equals(username))
//				.findFirst()
//				.orElseThrow(() -> new UsernameNotFoundException("사용자 정보를 찾을 수 없습니다."));
//		System.out.println("member.getName() : " + member.getName());
//		System.out.println("member.getId() : " + member.getId());
//		System.out.println("member.getPw() : " + member.getPw());
//		return User.builder().username(member.getId()) // 로그인 ID 적용
//				.password(member.getPw()) // 암호화된 비밀번호(BCrypt)
//				.roles(member.getRole()) // "USER", "ADMIN"
//				.build();

		/*
		 * 내부 흐름 정리!! 1. UsernamePasswordAuthenticationFilter 가 /loginProc 요청을 가로챔 2.
		 * 입력한 username/password를 AuthenticationManager 에게 전달 3. AuthenticationManager가
		 * UserDetailsService.loadUserByUsername() 호출 4. 여기서 DB(MemberRepository)에서 사용자
		 * 정보 조회 5. UserDetails 객체로 변환 후 Security에 반환 V V 6. PasswordEncoder.matches()로
		 * 비밀번호 비교 후 인증 성공 시 SecurityContextHolder 에 저장 7. 세션에 인증 정보가 등록 되어 이후 요청부터 자동인증
		 * 처리됨.
		 */
	}

}
