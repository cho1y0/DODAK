package com.smhrd.dodak.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.dodak.entity.Hospital;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Integer> {

    // 병원 이름에 특정 문자열이 포함된 병원 목록을 조회합니다.
    List<Hospital> findByHospNameContaining(String hospName);
}