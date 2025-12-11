package com.smhrd.dodak.service;

import com.smhrd.dodak.entity.Arrange;
import com.smhrd.dodak.entity.Doctor;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.repository.ArrangeRepository;
import com.smhrd.dodak.repository.DoctorRepository;
import com.smhrd.dodak.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ArrangeService {

    private final ArrangeRepository arrangeRepository;
    private final MemberRepository memberRepository;
    private final DoctorRepository doctorRepository;

    // --- C (Create: 의사 배치 정보 등록) ---
    @Transactional
    public Arrange save(Integer patientMemberId, Integer doctIdx) {
        // 1. FK 유효성 검사 및 엔티티 조회
        Member patient = memberRepository.findById(patientMemberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 환자(Member) ID입니다: " + patientMemberId));

        Doctor doctor = doctorRepository.findById(doctIdx)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 의사(Doctor) ID입니다: " + doctIdx));
        
        // 2. Arrange 엔티티 생성
        Arrange arrange = Arrange.builder()
                .patient(patient)
                .doctor(doctor)
                .build();
        
        // 3. 저장
        return arrangeRepository.save(arrange);
    }

    // --- R (Read: 상세 조회) ---
    public Optional<Arrange> findById(Integer arrangeIdx) {
        return arrangeRepository.findById(arrangeIdx);
    }

    // --- R (Read: 특정 환자의 배치 정보 조회) ---
    public List<Arrange> findByPatientId(Integer patientMemberId) {
        return arrangeRepository.findByPatient_Id(patientMemberId);
    }
    
    // --- R (Read: 특정 의사의 담당 환자 배치 정보 조회) ---
    public List<Arrange> findByDoctorId(Integer doctIdx) {
        return arrangeRepository.findByDoctor_DoctIdx(doctIdx);
    }

    // --- D (Delete: 배치 정보 삭제) ---
    @Transactional
    public void delete(Integer arrangeIdx) {
        arrangeRepository.deleteById(arrangeIdx);
    }
    
    // 참고: Arrange 엔티티는 연결 정보이므로 일반적으로 Update 메서드는 제공하지 않습니다.
    
    /**
     * ⭐️ 수정: 현재 로그인한 의사 회원 ID(doctIdx와 동일 가정)에게 이미 배정된 환자들의 Member ID 목록을 조회
     * @param memberId 현재 로그인한 의사의 Member ID
     * @return 배정된 환자 Member ID 목록
     */
    public List<Integer> getAssignedPatientIds(Integer memberId) {
        // memberId를 doctIdx로 간주하여 조회합니다.
        return arrangeRepository.findAssignedPatientIdsByDoctorId(memberId);
    }

	public void saveAll(List<Arrange> newArrangements) {
		// TODO Auto-generated method stub
		arrangeRepository.saveAll(newArrangements);
	}
}