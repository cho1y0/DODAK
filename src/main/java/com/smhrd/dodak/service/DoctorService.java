package com.smhrd.dodak.service;

import com.smhrd.dodak.entity.Doctor;
import com.smhrd.dodak.entity.Hospital;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.repository.DoctorRepository;
import com.smhrd.dodak.repository.HospitalRepository;
import com.smhrd.dodak.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final MemberRepository memberRepository;

    // --- C (Create: 의사 정보 등록) ---
    @Transactional
    public Doctor save(Integer memberId, Integer hospIdx, String specialty) {
        // 1. FK 유효성 검사 및 엔티티 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원(Member) ID입니다: " + memberId));

        Hospital hospital = hospitalRepository.findById(hospIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 병원(Hospital) ID입니다: " + hospIdx));
        
        Doctor findDoctor = doctorRepository.findByMemberId(memberId);
        
        if(findDoctor==null) {
        	// 2. Doctor 엔티티 생성
        	Doctor doctor = Doctor.builder()
                .member(member)
                .hospital(hospital)
                .specialty(specialty)
                .build();
        	// 3. 저장
        	return doctorRepository.save(doctor);
        } else {
        	Doctor doctor = Doctor.builder()
        			.doctIdx(findDoctor.getDoctIdx())
                    .member(member)
                    .hospital(hospital)
                    .specialty(specialty)
                    .build();
        	return doctorRepository.save(doctor);
        }
        
    }

    // --- R (Read: 상세 조회) ---
    public Optional<Doctor> findById(Integer doctIdx) {
        return doctorRepository.findById(doctIdx);
    }
    
    // --- R (Read: 상세 조회) ---
    public Optional<Doctor> findByMember(Member member) {
        return doctorRepository.findByMember(member);
    }

    // --- R (Read: 특정 병원 소속 의사 목록 조회) ---
    public List<Doctor> findByHospital(Integer hospIdx) {
        return doctorRepository.findByHospital_HospIdx(hospIdx);
    }

    

    // --- D (Delete: 의사 정보 삭제) ---
    @Transactional
    public void delete(Integer doctIdx) {
        doctorRepository.deleteById(doctIdx);
    }
}