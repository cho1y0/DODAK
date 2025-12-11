package com.smhrd.dodak.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.dodak.entity.Arrange;

@Repository
public interface ArrangeRepository extends JpaRepository<Arrange, Integer> {

    // 특정 환자 회원 ID에 대한 모든 배치 정보를 조회합니다. (FK: Member 엔티티의 id)
    List<Arrange> findByPatient_Id(Integer memberId); 
    
    // 특정 의사 ID가 담당하는 모든 환자 배치 정보를 조회합니다. (FK: Doctor 엔티티의 doctIdx)
    List<Arrange> findByDoctor_DoctIdx(Integer doctIdx); 
    
 // ⭐️ 수정: 현재 로그인한 회원의 ID(doct_idx와 동일하다고 가정)에게 배정된 환자들의 Member ID 목록 조회
    // Arrange 엔티티에서 patient 필드의 id(Member ID)를 추출합니다.
    @Query("SELECT a.patient.id FROM Arrange a WHERE a.doctor.doctIdx = :doctIdx")
    List<Integer> findAssignedPatientIdsByDoctorId(@Param("doctIdx") Integer doctIdx);
}