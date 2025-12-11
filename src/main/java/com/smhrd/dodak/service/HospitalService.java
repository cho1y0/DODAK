package com.smhrd.dodak.service;

import com.smhrd.dodak.entity.Hospital;
import com.smhrd.dodak.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    // --- C (Create: 병원 등록) ---
    @Transactional
    public Hospital save(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }

    // --- R (Read: 단일 병원 조회) ---
    public Optional<Hospital> findById(Integer hospIdx) {
        return hospitalRepository.findById(hospIdx);
    }

    // --- R (Read: 전체 병원 조회) ---
    public List<Hospital> findAll() {
        return hospitalRepository.findAll();
    }

    // --- R (Read: 병원 이름으로 검색) ---
    public List<Hospital> findByHospName(String hospName) {
        return hospitalRepository.findByHospNameContaining(hospName);
    }

    // --- U (Update: 병원 정보 수정) ---
    @Transactional
    public Hospital update(Integer hospIdx, String hospName, String zipCode, 
                           String addr1, String addr2, String tel) {
                           
        Hospital hospital = hospitalRepository.findById(hospIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 병원이 없습니다: " + hospIdx));

        // Entity 내부의 update 메서드를 호출하여 데이터 변경
        hospital.update(hospName, zipCode, addr1, addr2, tel);
        
        // Dirty Checking에 의해 자동 UPDATE
        return hospital;
    }

    // --- D (Delete: 병원 삭제) ---
    @Transactional
    public void delete(Integer hospIdx) {
        // 주의: 외래 키 제약 조건(tb_doctor, tb_arrange 등)을 먼저 처리해야 합니다.
        hospitalRepository.deleteById(hospIdx);
    }
}