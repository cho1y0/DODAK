package com.smhrd.dodak.entity;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;
//UserDetails 인터페이스 구현
public class CustomUserDetails implements UserDetails {

 private final Member member;

 public CustomUserDetails(Member member) {
     this.member = member;
 }

 // ⭐ Member의 PK(id)를 반환하는 커스텀 메서드
 public Integer getMemberId() {
     return member.getId();
 }

 // UserDetails 필수 구현 메서드 (Member 엔티티의 값 사용)
 @Override
 public Collection<? extends GrantedAuthority> getAuthorities() {
     // 권한 문자열(예: "ROLE_USER", "ROLE_DOCTOR")을 GrantedAuthority 객체로 변환
     return AuthorityUtils.createAuthorityList("ROLE_"+member.getRole());
 }

 @Override
 public String getPassword() {
     return member.getPassword();
 }

 @Override
 public String getUsername() {
     // Security에서 사용하는 사용자 이름은 로그인 ID(userId)를 사용
     return member.getUserId();
 }
 
 // 이하 계정 상태 관련 메서드들은 필요에 따라 true로 설정하거나 로직을 추가합니다.
 @Override
 public boolean isAccountNonExpired() { return true; }

 @Override
 public boolean isAccountNonLocked() { return true; }

 @Override
 public boolean isCredentialsNonExpired() { return true; }

 @Override
 public boolean isEnabled() { return true; }
}