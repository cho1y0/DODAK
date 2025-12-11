package com.smhrd.dodak.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.dodak.entity.Doctor;
import com.smhrd.dodak.entity.Hospital;
import com.smhrd.dodak.entity.Member;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    // 특정 병원 소속 의사 목록을 조회합니다. (FK: Hospital 엔티티의 hospIdx)
    List<Doctor> findByHospital_HospIdx(Integer hospIdx);
    
    // 특정 회원 ID에 매핑된 의사 정보(Doctor)를 조회합니다. (FK: Member 엔티티의 id)
    Optional<Doctor> findByMember_Id(Integer memberId);

	Doctor findByMemberId(Integer memberId);

	Optional<Doctor> findByMember(Member member);
}