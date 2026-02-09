package com.smhrd.dodak.controller;

import com.smhrd.dodak.entity.Doctor;
import com.smhrd.dodak.service.DoctorService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorRestController {

    private final DoctorService doctorService;

    // --- DTO for Request ---
    @Data
    private static class DoctorRequest {
        private Integer memberId; // FK: 회원 ID (의사 본인 계정)
        private Integer hospIdx;  // FK: 병원 ID
        private String specialty; // 전문 분야
    }

    // --- C (Create: 의사 정보 등록) ---
    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody DoctorRequest request) {
        try {
            Doctor savedDoctor = doctorService.save(
                request.getMemberId(),
                request.getHospIdx(),
                request.getSpecialty()
            );
            return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED); // 201 Created
        } catch (IllegalArgumentException e) {
            // FK (memberId, hospIdx)가 유효하지 않은 경우
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    // --- R (Read: 의사 상세 조회) ---
    @GetMapping("/{doctIdx}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Integer doctIdx) {
        return doctorService.findById(doctIdx)
                .map(doctor -> new ResponseEntity<>(doctor, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // 404 Not Found
    }
    
    // --- R (Read: 특정 병원 소속 의사 목록 조회) ---
    @GetMapping("/hospital/{hospIdx}")
    public ResponseEntity<List<Doctor>> getDoctorsByHospital(@PathVariable Integer hospIdx) {
        List<Doctor> doctors = doctorService.findByHospital(hospIdx);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }
    
    // --- D (Delete: 의사 정보 삭제) ---
    @DeleteMapping("/{doctIdx}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Integer doctIdx) {
        try {
            doctorService.delete(doctIdx);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (Exception e) {
            log.error("Failed to delete doctor - doctIdx: {}", doctIdx, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}