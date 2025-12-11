package com.smhrd.dodak.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.dodak.config.FileUploadConfig;
import com.smhrd.dodak.controller.MemberRestController.MemberResponse;
import com.smhrd.dodak.entity.Arrange;
import com.smhrd.dodak.entity.Doctor;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.entity.MemberInfoResponse;
import com.smhrd.dodak.repository.MemberRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
@Transactional(readOnly = true) // 기본적으로 읽기 전용 트랜잭션 적용
public class MemberService {
	PasswordEncoder passwordEncoder;
    private final MemberRepository memberRepository;
    private final DoctorService doctorService;
    private final ArrangeService arrangeService;
    
    @Autowired
	FileUploadConfig fileUploadConfig;

    // --- C (Create: 회원 가입/저장) ---
    @Transactional
    public Member save(Member member, MultipartFile profileImage) {
        // 1. 비즈니스 로직: ID 중복 검사
        if (memberRepository.existsByUserId(member.getUserId())) {
            throw new IllegalStateException("이미 존재하는 회원 아이디입니다: " + member.getUserId());
        }
        
        String password = member.getPassword();
        String encPassword = passwordEncoder.encode(password);
        member.setPassword(encPassword);
        // 2. 저장 (CREATE)
        
        String imgPath = null;
		String uploadDir = fileUploadConfig.getUploadDir();

		if (profileImage != null && !profileImage.isEmpty()) {
			// 이미지가 들어 왔을 때 파일의 이름 설정
			// 랜덤 ID 값 설정
			// UUID(Universally Unique IDentifier)
			String fileName = UUID.randomUUID() + "_" + profileImage.getOriginalFilename();

			// 경로 설정 -> 데이터 저장시 -> C:/upload/uuid이름지어진파일명.jpg
			// uploadDir + fileName
			// OS 에 따라 윈도우는 \ 리눅스나 맥 /
			// OS 에 따라 경로 구분 자동처리
			String filePath = Paths.get(uploadDir, fileName).toString();

			// 만약에 디렉토리가 없으면 생성하는 코드
			File dir = new File(uploadDir);
			if (!dir.exists()) {
				// 폴더가 존재하지 않으면
				dir.mkdir();
			}

			// image.transferTo(new File(경로)) --> 해당 경로에 이미지 삽입 코드
			try {
				profileImage.transferTo(new File(filePath));
				imgPath = "/uploads/" + fileName;
			} catch (IllegalStateException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			member.setProfileImg(imgPath);
		}
        
        Member savedMember = memberRepository.save(member);
        
        String role = member.getRole();
        if(role.equals("DOCTOR")) {
        	int savedMemberId = savedMember.getId();
        	Integer hospIdx = member.getHospIdx();
        	String specialty = member.getSpecialty();
        	doctorService.save(savedMemberId, hospIdx, specialty);
        }
        return savedMember; 
    }

    // --- R (Read: 단일 회원 조회 - PK) ---
    public Optional<Member> findById(Integer id) {
        return memberRepository.findById(id);
    }

    // --- R (Read: 단일 회원 조회 - user_id) ---
    public Optional<Member> findByUserId(String userId) {
        return memberRepository.findByUserId(userId);
    }

    // --- R (Read: 전체 회원 조회) ---
    public List<Member> findAll() {
        return memberRepository.findAll();
    }

    // --- U (Update: 회원 정보 수정) ---
    @Transactional
    public Member update(Member member, MultipartFile profileImage, String oldImgPath) {
    	Member existMember = memberRepository.findById(member.getId())
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + member.getId()));
    	
    	String password = member.getPassword();
    	if(password.length()>0) {
    		String encPassword = passwordEncoder.encode(password);
            member.setPassword(encPassword);	
    	} else {    		
    		member.setPassword(existMember.getPassword());
    	}
        String imgPath = null;
		String uploadDir = fileUploadConfig.getUploadDir();

		if (profileImage != null && !profileImage.isEmpty()) {
			if (!oldImgPath.isEmpty() && oldImgPath != null) {
				// 경로 접근
				Path oldPath = Paths.get(uploadDir, oldImgPath.replace("/uploads/", ""));
				// 이미지 삭제
				try {
					Files.deleteIfExists(oldPath);
				} catch (IOException e) {
					e.printStackTrace();
				}

			}
			// 이미지가 들어 왔을 때 파일의 이름 설정
			// 랜덤 ID 값 설정
			// UUID(Universally Unique IDentifier)
			String fileName = UUID.randomUUID() + "_" + profileImage.getOriginalFilename();

			// 경로 설정 -> 데이터 저장시 -> C:/upload/uuid이름지어진파일명.jpg
			// uploadDir + fileName
			// OS 에 따라 윈도우는 \ 리눅스나 맥 /
			// OS 에 따라 경로 구분 자동처리
			String filePath = Paths.get(uploadDir, fileName).toString();

			// 만약에 디렉토리가 없으면 생성하는 코드
			File dir = new File(uploadDir);
			if (!dir.exists()) {
				// 폴더가 존재하지 않으면
				dir.mkdir();
			}

			// image.transferTo(new File(경로)) --> 해당 경로에 이미지 삽입 코드
			try {
				profileImage.transferTo(new File(filePath));
				imgPath = "/uploads/" + fileName;
			} catch (IllegalStateException e) {
				e.printStackTrace();
			} catch (IOException e) {
				e.printStackTrace();
			}
			member.setProfileImg(imgPath);
		}
        
        Member savedMember = memberRepository.save(member);
        
        String role = member.getRole();
        if(role.equals("DOCTOR")) {        	
        	Integer savedMemberId = savedMember.getId();
        	Integer hospIdx = member.getHospIdx();
        	String specialty = member.getSpecialty();
        	doctorService.save(savedMemberId, hospIdx, specialty);
        }
        return savedMember;
    }

    // --- D (Delete: 회원 삭제) ---
    @Transactional
    public void delete(Integer id) {
        memberRepository.deleteById(id);
    }

	public Optional<Member> findByEmail(String email) {
		 return memberRepository.findByEmail(email);
		
	}
	
	public List<MemberResponse> getAllMembers() {
	    // MemberRepository.findAll() 호출 후 List<MemberResponse>로 변환
	    return memberRepository.findAll().stream()
	            .map(MemberResponse::new)
	            .collect(Collectors.toList());
	}

	public MemberInfoResponse getMemberInfo(Integer memberId) {
		Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + memberId));
		
        Optional<Doctor> doctor = doctorService.findByMember(member);
        if(doctor.isPresent()) {
        	Integer hospIdx = doctor.get().getHospital().getHospIdx();
        	String hospName = doctor.get().getHospital().getHospName();
            String specialty = doctor.get().getSpecialty();	
            member.setHospIdx(hospIdx);
            member.setHospName(hospName);
            member.setSpecialty(specialty);
        }
        // Entity를 Response DTO로 변환하여 반환
        return MemberInfoResponse.of(member);
	}
	
    public List<Member> findByRole(String role) {
        return memberRepository.findByRole(role);
    }
    
    public List<Member> findUnassignedUsers(Integer memberId) {
    	Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + memberId));
        // 1. 의사(Doctor) 엔티티 조회 및 유효성 검사
        Doctor doctor = doctorService.findByMember(member)
            .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + member.getId()));
    	
        List<Integer> assignedPatientIds = arrangeService.getAssignedPatientIds(doctor.getDoctIdx());
        
        // 2. MemberRepository.findByRoleAndIdNotIn 호출 (가정)
        if(assignedPatientIds.size()>0) {
        	return memberRepository.findByRoleAndIdNotIn("USER", assignedPatientIds);	
        } else {
        	return memberRepository.findByRole("USER");
        }
    }
    
    public List<Member> findAssignedUsers(Integer memberId) {
    	Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + memberId));
        // 1. 의사(Doctor) 엔티티 조회 및 유효성 검사
        Doctor doctor = doctorService.findByMember(member)
            .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + member.getId()));
        List<Integer> assignedPatientIds = arrangeService.getAssignedPatientIds(doctor.getDoctIdx());
        if(assignedPatientIds.size()>0) {
        	// 2. MemberRepository.findByRoleAndIdNotIn 호출 (가정)
            return memberRepository.findByRoleAndIdIn("USER", assignedPatientIds);	
        } else {
        	List<Member> list= new ArrayList<>();
        	return list;
        }
        
    }
    
    /**
     * 최종 배정 정보를 저장합니다. (기존 배정 삭제 후 신규 배정 등록)
     * * @param doctIdx 배정 대상 의사의 고유 ID (Doctor PK)
     * @param assignedPatientIds 배정할 환자들의 Member ID 리스트
     */
    @Transactional // 트랜잭션 처리: 이 과정 전체가 성공하거나 실패해야 합니다 (원자성 보장)
    public void saveAssignments(Integer memberId, List<Integer> assignedPatientIds) {
    	Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + memberId));
        // 1. 의사(Doctor) 엔티티 조회 및 유효성 검사
        Doctor doctor = doctorService.findByMember(member)
            .orElseThrow(() -> new IllegalArgumentException("Doctor not found with ID: " + member.getId()));
        
        
        // 3. 신규 배정 정보가 있다면 등록합니다.
        if (assignedPatientIds != null && !assignedPatientIds.isEmpty()) {
            
            // 모든 환자(Member) 엔티티를 한 번에 조회합니다 (쿼리 최적화).
            List<Member> patients = memberRepository.findAllById(assignedPatientIds);
            
            if (patients.size() != assignedPatientIds.size()) {
                 System.err.println("Warning: " + (assignedPatientIds.size() - patients.size()) + " patient IDs were not found.");
            }

            // Arrange 엔티티 리스트를 생성합니다.
            List<Arrange> newArrangements = patients.stream()
                .map(patient -> Arrange.builder()
                    .doctor(doctor) // 1단계에서 조회한 Doctor 엔티티
                    .patient(patient) // 조회된 Member 엔티티 (환자)
                    .build())
                .collect(Collectors.toList());

            // 모든 신규 Arrange 엔티티를 저장합니다.
            arrangeService.saveAll(newArrangements);
            
            System.out.println("Successfully saved " + newArrangements.size() + " new assignments.");
        } else {
             System.out.println("No patients were assigned, clearing assignments complete.");
        }
    }
}