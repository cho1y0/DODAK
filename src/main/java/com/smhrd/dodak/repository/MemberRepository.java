package com.smhrd.dodak.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.dodak.entity.Member;

// tb_member
@Repository
public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByUserId(String userId);
    boolean existsByUserId(String userId);
	Optional<Member> findByEmail(String email);
	
	List<Member> findByRole(String role);
	List<Member> findByRoleAndIdNotIn(String role, List<Integer> assignedPatientIds);
	// ⭐️ 배정된 환자 조회: role이 'USER'이면서, ID가 assignedIds 목록에 포함된 Member를 조회
    List<Member> findByRoleAndIdIn(String role, List<Integer> assignedIds);

    // 환자 상태별 조회 (1=경증, 2=중증)
    List<Member> findByPatientStatus(Integer patientStatus);

    // 역할과 환자 상태로 조회 (예: 중증 환자만 조회)
    List<Member> findByRoleAndPatientStatus(String role, Integer patientStatus);

    // 배정된 환자 중 특정 상태인 환자 조회
    List<Member> findByRoleAndIdInAndPatientStatus(String role, List<Integer> assignedIds, Integer patientStatus);

    // 비밀번호 찾기: 아이디와 이메일로 회원 조회
    Optional<Member> findByUserIdAndEmail(String userId, String email);
}