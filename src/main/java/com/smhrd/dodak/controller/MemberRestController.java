package com.smhrd.dodak.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smhrd.dodak.config.FileUploadConfig;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.entity.MemberInfoResponse;
import com.smhrd.dodak.service.MemberService;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberRestController {

    private final MemberService memberService;
    
    @Autowired
	FileUploadConfig fileUploadConfig;
    // --- DTO for Request (Join/Update) ---
    @Data
    private static class MemberRequest {
        private String userId;
        private String password;
        private String name;
        private String email;
        private String phone;
        private String zipCode;
        private String addr1;
        private String addr2;
        private String agreementYn; // 가입 시 필요
        private String role;        // 가입 시 필요
        private int hospIdx;
        private String specialty;
        private String profileImg;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberResponse {
        private Integer id;
        private String name;
        private String phone;
        
        public MemberResponse(Member member) {
            this.id = member.getId();
            this.name = member.getName();
            this.phone = member.getPhone();
        }
    }
    
 // =======================================================
    // 📢 1. DTO for Patient Assignment Request (신규 추가)
    // =======================================================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientAssignmentRequest {
        private Integer memberId; // 의사의 MemberId (id)
        private List<Integer> assignedPatientIds; // 배정할 환자들의 Member ID (PK) 리스트
    }
	/*
	 * // --- C (Create: 회원 가입) ---
	 * 
	 * @PostMapping("/join") public ResponseEntity<Member> join(@RequestBody Member
	 * member) { try { Member savedMember = memberService.save(member);
	 * 
	 * return new ResponseEntity<>(savedMember, HttpStatus.CREATED); // 201 Created
	 * } catch (IllegalStateException e) { // 중복 회원 등의 비즈니스 로직 예외 처리 return new
	 * ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict } }
	 */
    
    @PostMapping(value = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Member> join(
        @ModelAttribute Member member, // Receives non-file fields (username, email, etc.)
        @RequestParam("profileImage") MultipartFile profileImage // Receives the file from the input name="profileImage"
    ) {
        try {
            Member savedMember = memberService.save(member, profileImage);
            
            return new ResponseEntity<>(savedMember, HttpStatus.CREATED); // 201 Created
        } catch (IllegalStateException e) {
            // 중복 회원 등의 비즈니스 로직 예외 처리
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        } catch (Exception e) {
            // 파일 처리 중 발생할 수 있는 IO 예외 등을 처리합니다.
            log.error("Failed to join member - userId: {}", member.getUserId(), e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }

    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Member> update(
        @ModelAttribute Member member,
        @RequestParam String oldImgPath,
        @RequestParam("profileImage") MultipartFile profileImage) {

        log.debug("Update member: {}", member);
        try {
            Member savedMember = memberService.update(member, profileImage, oldImgPath);
            
            return new ResponseEntity<>(savedMember, HttpStatus.CREATED); // 201 Created
        } catch (IllegalStateException e) {
            // 중복 회원 등의 비즈니스 로직 예외 처리
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        } catch (Exception e) {
            // 파일 처리 중 발생할 수 있는 IO 예외 등을 처리합니다.
            log.error("Failed to update member - memberId: {}", member.getId(), e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }

    // --- R (Read: 전체 회원 조회) ---
    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {
        return new ResponseEntity<>(memberService.findAll(), HttpStatus.OK); // 200 OK
    }
    
    // --- R (Read: 회원 상세 조회 - ID) ---
    @GetMapping("/member/{userId}")
    public ResponseEntity<Member> getMemberByUserId(@PathVariable String userId) {
        return memberService.findByUserId(userId)
                .map(member -> new ResponseEntity<>(member, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // 404 Not Found
    }
    
    // --- R (Read: 회원 상세 조회 - ID) ---
    @PostMapping("/member")
    public ResponseEntity<Member> getMemberByUserId2(@RequestParam String userId) {
        log.debug("getMemberByUserId2: {}", userId);
        return memberService.findByUserId(userId)
                .map(member -> new ResponseEntity<>(member, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/checkId")
    public boolean checkId(@RequestParam String userId) {
        log.debug("checkId: {}", userId);
        Optional<Member> member = memberService.findByUserId(userId);
		if(!member.isEmpty()) {			
			return false;
		} else {			
			return true;
		}
	}
    
    @GetMapping("/checkEmail")
	public boolean checkEmail(@RequestParam String email) {
    	
		Optional<Member> member = memberService.findByEmail(email);
		if(!member.isEmpty()) {			
			return false;
		} else {			
			return true;
		}
	}

    // --- D (Delete: 회원 삭제) ---
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Integer id) {
        memberService.delete(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<MemberResponse>> getAllMemberResponses() {
        List<MemberResponse> members = memberService.getAllMembers();
        return new ResponseEntity<>(members, HttpStatus.OK);
    }
    
    /**
     * GET: 회원 정보 조회
     * /api/member/info/{memberId}
     * * @param memberId 조회할 회원의 고유 ID
     * @return 회원 정보 응답 DTO
     */
    @GetMapping("/info/{memberId}")
    public ResponseEntity<MemberInfoResponse> getMemberInfo(@PathVariable Integer memberId) {
        // 실제 환경에서는 @AuthenticationPrincipal을 사용하여 본인 정보만 조회하도록 제한해야 함
        MemberInfoResponse memberInfo = memberService.getMemberInfo(memberId);
        return ResponseEntity.ok(memberInfo);
    }
    
    
    @GetMapping("/users/unassigned/{memberId}")
    public ResponseEntity<List<Member>> getUnassignedUsers(@PathVariable Integer memberId) {
        List<Member> users = memberService.findUnassignedUsers(memberId);
        log.debug("getUnassignedUsers length: {}", users.size());
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/users/assigned/{memberId}")
    public ResponseEntity<List<Member>> getAssignedUsers(@PathVariable Integer memberId) {
        List<Member> users = memberService.findAssignedUsers(memberId);
        log.debug("getAssignedUsers length: {}", users.size());
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
 // =======================================================
    // 📢 2. Patient Assignment Endpoint (신규 추가)
    // =======================================================
    /**
     * POST: 최종 배정 정보 저장 (최종 배정 정보 저장 버튼 클릭 시 호출)
     * URL: /api/members/assignments
     * @param request Doctor ID와 배정된 환자 Member ID 리스트
     * @return 성공/실패 응답
     */
    @PostMapping("/assignments")
    public ResponseEntity<Void> saveFinalAssignments(
            @RequestBody PatientAssignmentRequest request) {

        log.debug("Received assignment request for memberId: {}, patientIds: {}",
                request.getMemberId(), request.getAssignedPatientIds());

        if (request.getMemberId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        try {
            memberService.saveAssignments(request.getMemberId(), request.getAssignedPatientIds());
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (IllegalArgumentException e) {
            log.warn("Assignment error (Not Found): {}", e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            log.error("Error saving assignments", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =======================================================
    // 📢 환자 상태 업데이트 (1=경증, 2=중증)
    // =======================================================
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientStatusRequest {
        private Integer patientStatus; // 1=경증, 2=중증
    }

    /**
     * PATCH: 환자 상태 토글/업데이트
     * URL: /api/members/{id}/patient-status
     * @param id 환자의 Member ID
     * @param request 새로운 상태 값
     * @return 업데이트된 Member 정보
     */
    @PatchMapping("/{id}/patient-status")
    public ResponseEntity<Member> updatePatientStatus(
            @PathVariable Integer id,
            @RequestBody PatientStatusRequest request) {

        log.debug("Updating patient status for memberId: {}, newStatus: {}",
                id, request.getPatientStatus());

        if (request.getPatientStatus() == null ||
            (request.getPatientStatus() != 1 && request.getPatientStatus() != 2)) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        try {
            Member updatedMember = memberService.updatePatientStatus(id, request.getPatientStatus());
            return new ResponseEntity<>(updatedMember, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error updating patient status for memberId: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * GET: 의사에게 배정된 중증 환자 목록 조회
     * URL: /api/members/severe/{memberId}
     * @param memberId 의사의 Member ID
     * @return 중증 환자 목록
     */
    @GetMapping("/severe/{memberId}")
    public ResponseEntity<List<Member>> getSeverePatients(@PathVariable Integer memberId) {
        try {
            List<Member> severePatients = memberService.findSeverePatients(memberId);
            if (severePatients.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(severePatients, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error fetching severe patients for memberId: {}", memberId, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}