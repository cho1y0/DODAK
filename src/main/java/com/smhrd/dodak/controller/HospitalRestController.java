package com.smhrd.dodak.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smhrd.dodak.entity.Hospital;
import com.smhrd.dodak.service.HospitalService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalRestController {

    private final HospitalService hospitalService;

    // --- DTO for Request (Create/Update) ---
    @Data
    private static class HospitalRequest {
        private String hospName;
        private String zipCode;
        private String addr1;
        private String addr2;
        private String tel;
    }

    // --- C (Create: 병원 등록) ---
    @PostMapping("/save")
    public ResponseEntity<Hospital> createHospital(@RequestBody HospitalRequest request) {
        // DTO를 Entity로 변환
    	System.out.println("createHospital 호출됨");
    	System.out.println("request.getHospName()" + request.getHospName());
    	System.out.println("request.getZipCode()" + request.getZipCode());
    	System.out.println("request.getTel()" + request.getTel());
        Hospital newHospital = Hospital.builder()
            .hospName(request.getHospName())
            .zipCode(request.getZipCode())
            .addr1(request.getAddr1())
            .addr2(request.getAddr2())
            .tel(request.getTel())
            .build();
            
        Hospital savedHospital = hospitalService.save(newHospital);
        return new ResponseEntity<>(savedHospital, HttpStatus.CREATED); // 201 Created
    }

    // --- R (Read: 전체 병원 조회) ---
    @GetMapping("/all")
    public ResponseEntity<List<Hospital>> getAllHospitals() {
    	System.out.println("getAllHospitals 호출됨");
        return new ResponseEntity<>(hospitalService.findAll(), HttpStatus.OK);
    }
    
    // --- R (Read: 병원 이름으로 검색) ---
    @GetMapping("/search")
    public ResponseEntity<List<Hospital>> searchHospitalsByName(@RequestParam("name") String name) {
    	System.out.println("name : " + name);
        List<Hospital> hospitals = hospitalService.findByHospName(name);
        return new ResponseEntity<>(hospitals, HttpStatus.OK);
    }

    // --- R (Read: 병원 상세 조회 - PK) ---
    @GetMapping("/{hospIdx}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable Integer hospIdx) {
    	System.out.println("getHospitalById : " + hospIdx);
        return hospitalService.findById(hospIdx)
                .map(hospital -> new ResponseEntity<>(hospital, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // 404 Not Found
    }

    // --- U (Update: 병원 정보 수정) ---
    @PutMapping("/{hospIdx}")
    public ResponseEntity<Hospital> updateHospital(@PathVariable Integer hospIdx, @RequestBody HospitalRequest request) {
        try {
            Hospital updatedHospital = hospitalService.update(
                hospIdx, 
                request.getHospName(), 
                request.getZipCode(), 
                request.getAddr1(), 
                request.getAddr2(), 
                request.getTel()
            );
            return new ResponseEntity<>(updatedHospital, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // --- D (Delete: 병원 삭제) ---
    @DeleteMapping("/{hospIdx}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Integer hospIdx) {
        try {
            hospitalService.delete(hospIdx);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (Exception e) {
            // FK 제약 조건 위반 등의 예외 처리
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    
}