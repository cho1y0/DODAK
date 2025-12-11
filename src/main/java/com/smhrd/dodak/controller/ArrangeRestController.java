package com.smhrd.dodak.controller;

import com.smhrd.dodak.entity.Arrange;
import com.smhrd.dodak.service.ArrangeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/arrangements")
@RequiredArgsConstructor
public class ArrangeRestController {

    private final ArrangeService arrangeService;

    // --- DTO for Request ---
    @Data
    private static class ArrangeRequest {
        private Integer patientMemberId; // FK: 환자 회원 ID
        private Integer doctIdx;         // FK: 의사 ID
    }

    // --- C (Create: 의사 배치 정보 등록) ---
    @PostMapping
    public ResponseEntity<Arrange> createArrangement(@RequestBody ArrangeRequest request) {
        try {
            Arrange savedArrange = arrangeService.save(
                request.getPatientMemberId(),
                request.getDoctIdx()
            );
            return new ResponseEntity<>(savedArrange, HttpStatus.CREATED); // 201 Created
        } catch (IllegalArgumentException e) {
            // FK (patientMemberId, doctIdx)가 유효하지 않은 경우
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    // --- R (Read: 상세 조회) ---
    @GetMapping("/{arrangeIdx}")
    public ResponseEntity<Arrange> getArrangementById(@PathVariable Integer arrangeIdx) {
        return arrangeService.findById(arrangeIdx)
                .map(arrange -> new ResponseEntity<>(arrange, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // --- R (Read: 특정 환자의 담당 의사 배치 정보 조회) ---
    @GetMapping("/patient/{memberId}")
    public ResponseEntity<List<Arrange>> getArrangementsByPatient(@PathVariable Integer memberId) {
        List<Arrange> arranges = arrangeService.findByPatientId(memberId);
        return new ResponseEntity<>(arranges, HttpStatus.OK);
    }

    // --- R (Read: 특정 의사의 담당 환자 배치 정보 조회) ---
    @GetMapping("/doctor/{doctIdx}")
    public ResponseEntity<List<Arrange>> getArrangementsByDoctor(@PathVariable Integer doctIdx) {
        List<Arrange> arranges = arrangeService.findByDoctorId(doctIdx);
        return new ResponseEntity<>(arranges, HttpStatus.OK);
    }

    // --- D (Delete: 배치 정보 삭제) ---
    @DeleteMapping("/{arrangeIdx}")
    public ResponseEntity<Void> deleteArrangement(@PathVariable Integer arrangeIdx) {
        try {
            arrangeService.delete(arrangeIdx);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}