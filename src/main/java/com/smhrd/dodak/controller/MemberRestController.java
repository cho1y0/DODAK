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
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }
    
    @PutMapping(value = "/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Member> update(
        @ModelAttribute Member member, // Receives non-file fields (username, email, etc.)
        @RequestParam String oldImgPath,
        @RequestParam("profileImage") MultipartFile profileImage) {
    	
    	System.out.println("member : " + member.toString());
        try {
            Member savedMember = memberService.update(member, profileImage, oldImgPath);
            
            return new ResponseEntity<>(savedMember, HttpStatus.CREATED); // 201 Created
        } catch (IllegalStateException e) {
            // 중복 회원 등의 비즈니스 로직 예외 처리
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        } catch (Exception e) {
            // 파일 처리 중 발생할 수 있는 IO 예외 등을 처리합니다.
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
    public ResponseEntity<Member> getMemberByUserId2(@RequestParam String userId){
    	System.out.println("getMemberByUserId2 " + userId);
        return memberService.findByUserId(userId)
                .map(member -> new ResponseEntity<>(member, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // 404 Not Found
    }
    
    @GetMapping("/checkId")
	public boolean checkId(@RequestParam String userId) {
    	System.out.println("checkId : " + userId);
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
        // memberId를 findUnassignedUsers 메서드에 전달합니다.
        List<Member> users = memberService.findUnassignedUsers(memberId);
        System.out.println("getUnassignedUsers length : " + users.size());
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(users, HttpStatus.OK); // 200 OK
    }
    
    @GetMapping("/users/assigned/{memberId}")
    public ResponseEntity<List<Member>> getAssignedUsers(@PathVariable Integer memberId) {
        // memberId를 findUnassignedUsers 메서드에 전달합니다.
        List<Member> users = memberService.findAssignedUsers(memberId);
        System.out.println("getAssignedUsers length : " + users.size());
        if (users.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        }
        return new ResponseEntity<>(users, HttpStatus.OK); // 200 OK
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
        
        System.out.println("Received assignment request for doctId: " + request.getMemberId());
        System.out.println("Assigned patient IDs: " + request.getAssignedPatientIds());

        // 기본 유효성 검사
        if (request.getMemberId() == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // 400 Bad Request
        }

        try {
            // Service 계층으로 로직 위임 (doctId는 Doctor의 PK이므로 Integer 타입)
            memberService.saveAssignments(request.getMemberId(), request.getAssignedPatientIds());
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content (성공)
        } catch (IllegalArgumentException e) {
            // Doctor 또는 Patient ID가 유효하지 않을 때 (Service에서 throw)
            System.err.println("Assignment error (Not Found): " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // 404 Not Found
        } catch (Exception e) {
            System.err.println("Error saving assignments: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    } 
    
}