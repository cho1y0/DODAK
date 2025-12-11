package com.smhrd.dodak.controller;

import java.math.BigDecimal;
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

import com.smhrd.dodak.controller.DiaryRestController.DiaryResponse;
import com.smhrd.dodak.entity.Analysis;
import com.smhrd.dodak.service.AnalysisService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analyses")
@RequiredArgsConstructor
public class AnalysisRestController {

    private final AnalysisService analysisService;

    // --- DTO for Request ---
    @Data
    private static class AnalysisRequest {
        private Integer diaryIdx;        // FK: 일기 ID
        private String diaryContent;
        private String modelName;       // 모델 명
        
        private BigDecimal anxietyRatio; // 불안 비율
        private BigDecimal sadnessRatio; // 슬픔 비율
        private BigDecimal joyRatio;     // 기쁨 비율
        private BigDecimal angerRatio;   // 분노 비율
        private BigDecimal regretRatio;  // 후회 비율
        private BigDecimal hopeRatio;
        private BigDecimal neutralityRatio;
        private BigDecimal tirednessRatio;
        private BigDecimal depressionRatio;
        
    }

    // --- C (Create: 분석 결과 등록) ---
    @PostMapping
    public ResponseEntity<Analysis> createAnalysis(@RequestBody AnalysisRequest request) {
        try {
            Analysis savedAnalysis = analysisService.save(            		
                request.getDiaryIdx(),
                request.getModelName(),                
                request.getAnxietyRatio(),
                request.getSadnessRatio(),
                request.getJoyRatio(),
                request.getAngerRatio(),
                request.getRegretRatio(),
                request.getHopeRatio(),
                request.getNeutralityRatio(),
                request.getTirednessRatio(),
                request.getDepressionRatio()
                
            );
            return new ResponseEntity<>(savedAnalysis, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // diaryIdx가 유효하지 않은 경우
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            // 이미 분석 결과가 존재하는 경우
            return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
        }
    }

    // --- R (Read: 상세 조회) ---
    @GetMapping("/{analysisIdx}")
    public ResponseEntity<Analysis> getAnalysisById(@PathVariable Integer analysisIdx) {
        return analysisService.findById(analysisIdx)
                .map(analysis -> new ResponseEntity<>(analysis, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
    
    // --- R (Read: 특정 일기의 분석 결과 조회) ---
    @GetMapping("/diary/{diaryIdx}")
    public ResponseEntity<Analysis> getAnalysisByDiary(@PathVariable Integer diaryIdx) {
        return analysisService.findByDiaryId(diaryIdx)
                .map(analysis -> new ResponseEntity<>(analysis, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // --- U (Update: 분석 결과 수정) ---
    @PutMapping("/{analysisIdx}")
    public ResponseEntity<Analysis> updateAnalysis(@PathVariable Integer analysisIdx, @RequestBody AnalysisRequest request) {
        try {
            Analysis updatedAnalysis = analysisService.update(
                analysisIdx, 
                request.getModelName(),                
                request.getAnxietyRatio(),
                request.getSadnessRatio(),
                request.getJoyRatio(),
                request.getAngerRatio(),
                request.getRegretRatio(),
                request.getHopeRatio(),
                request.getNeutralityRatio(),
                request.getTirednessRatio(),
                request.getDepressionRatio()                
            );
            return new ResponseEntity<>(updatedAnalysis, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // --- D (Delete: 분석 결과 삭제) ---
    @DeleteMapping("/{analysisIdx}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable Integer analysisIdx) {
        try {
            analysisService.delete(analysisIdx);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * 특정 환자의 특정 연월에 대한 감정 분석 데이터를 조회합니다.
     * * @param memberId 조회할 환자의 PK
     * @param year 조회할 연도 (YYYY)
     * @param month 조회할 월 (1~12)
     * @return 해당 월의 일기별 감정 분석 비율 데이터 리스트 (DiaryResponse DTO)
     */
    @GetMapping("/monthly")
    public ResponseEntity<List<DiaryResponse>> getMonthlyAnalysis(
            @RequestParam("memberId") Integer memberId,
            @RequestParam("year") int year,
            @RequestParam("month") int month) {
        
        // 1. 서비스 로직 호출 (AnalysisService.java의 Mock 메서드와 연결됨)
        // 실제 구현 시, 해당 메서드는 Repository를 통해 DB에서 데이터를 조회해야 합니다.
        List<DiaryResponse> analysisData = analysisService.getMonthlyAnalysisData(memberId, year, month);

        // 2. 데이터 반환
        if (analysisData.isEmpty()) {
            // 데이터가 없는 경우 204 No Content 또는 빈 리스트 (200 OK) 반환
            return ResponseEntity.ok(analysisData);
        }
        
        return ResponseEntity.ok(analysisData);
    }
}