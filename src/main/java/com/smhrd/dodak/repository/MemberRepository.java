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
}