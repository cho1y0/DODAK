package com.smhrd.dodak.controller;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import com.smhrd.dodak.entity.Analysis;
import com.smhrd.dodak.entity.Diary;
import com.smhrd.dodak.service.AnalysisService;
import com.smhrd.dodak.service.DiaryService;
import com.smhrd.dodak.service.MemberService;

import jakarta.servlet.http.HttpSession;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/diaries")
@RequiredArgsConstructor
public class DiaryRestController {

    private final DiaryService diaryService;
    private final AnalysisService analysisService;

    // --- DTO for Request (Create/Update) ---
    @Data
    private static class DiaryRequest {
        private Integer memberId;      // FK: 회원 ID (작성 시 필수)
        private String diaryTitle;
        private String diaryContent;
        private String file1;
        private String file2;
        private String file3;
    }
    
    @Data // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor 제공
    @NoArgsConstructor // 기본 생성자 자동 생성
    @AllArgsConstructor // 모든 필드를 인수로 받는 생성자 자동 생성
    public static class DiarySearchRequest {
        
        // 연도 검색 조건 (YYYY)
        private String year;
        
        // 월 검색 조건 (MM)
        private String month;
        
        // 일 검색 조건 (DD)
        private String day;
        
        // 제목 또는 내용 검색 키워드
        private String keyword;
        
     // ⭐️ 추가: 검색할 사용자의 ID (Select Box에서 선택된 값)
        private Integer selectedMemberId;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiaryResponse {
        private Integer diaryIdx;
        private String diaryTitle;
        private String diaryContent;
        // Member 전체 객체 대신 필요한 정보만 포함
        private Integer memberId; 
        private String memberName;
        private Timestamp createdAt;
        private String createdAtDate; // 작성 일자 (D, 일)
        
        
        private String modelName;        
        private BigDecimal anxietyRatio;
        private BigDecimal sadnessRatio;
        private BigDecimal joyRatio;
        private BigDecimal angerRatio;
        private BigDecimal regretRatio;
        private BigDecimal hopeRatio;
        private BigDecimal neutralityRatio;
        private BigDecimal tirednessRatio;
        private BigDecimal depressionRatio;

        public DiaryResponse(Diary diary) {
            this.diaryIdx = diary.getDiaryIdx();
            this.diaryTitle = diary.getDiaryTitle();
            this.diaryContent = diary.getDiaryContent();
            
            // Member 정보 할당
            this.memberId = diary.getMember().getId(); 
            this.memberName = diary.getMember().getName();
            
            // 날짜/시간 정보 할당
            this.createdAt = diary.getCreatedAt();
            this.createdAtDate = diary.getCreatedAt().toLocalDateTime().format(DateTimeFormatter.ofPattern("d")); // 'd'만 추출
            
            // ⭐️ Analysis 정보 복사
            Analysis analysis = diary.getAnalysis();
            if (analysis != null) {
                this.modelName = analysis.getModelName();                
                this.anxietyRatio = analysis.getAnxietyRatio();
                this.sadnessRatio = analysis.getSadnessRatio();
                this.joyRatio = analysis.getJoyRatio();
                this.angerRatio = analysis.getAngerRatio();
                this.regretRatio = analysis.getRegretRatio();
                this.hopeRatio = analysis.getHopeRatio();
                this.neutralityRatio = analysis.getNeutralityRatio();
                this.tirednessRatio = analysis.getTirednessRatio();
                this.depressionRatio = analysis.getDepressionRatio();
            } 
            // analysis가 null일 경우, 모든 Ratio 필드는 기본값(null 또는 0)을 가집니다.
        }

		private void createdAtDate(String format) {
			// TODO Auto-generated method stub
			
		}
    }

    // --- C (Create: 일기 작성) ---
    @PostMapping
    public ResponseEntity<Diary> createDiary(@RequestBody DiaryRequest request, HttpSession session) {
        try {
        	System.out.println("createDiary start");
        	Diary diary = Diary.builder()
        					.memberId(request.memberId)
        					.diaryTitle(request.diaryTitle)
        					.diaryContent(request.diaryContent)
        					.file1(request.file1)
        					.file2(request.file2)
        					.file2(request.file2).build();
        	// Service에서 일기 저장 및 AI 분석 요청까지 모두 처리
            Diary savedDiary = diaryService.writeDiaryAndAnalyze(diary);
           
            return new ResponseEntity<>(savedDiary, HttpStatus.CREATED); // 201 Created
        } catch (IllegalArgumentException e) {
            // memberId가 유효하지 않은 경우
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST); // 400 Bad Request
        }
    }

    // --- R (Read: 일기 상세 조회) ---
    @GetMapping("/{diaryIdx}")
    public ResponseEntity<Diary> getDiaryById(@PathVariable Integer diaryIdx) {
        return diaryService.findById(diaryIdx)
                .map(diary -> new ResponseEntity<>(diary, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // 404 Not Found
    }
    
    // --- R (Read: 특정 회원의 전체 일기 목록 조회) ---
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Diary>> getDiariesByMember(@PathVariable Integer memberId) {
        List<Diary> diaries = diaryService.findAllByMemberId(memberId);
        return new ResponseEntity<>(diaries, HttpStatus.OK);
    }

    // --- U (Update: 일기 수정) ---
    @PutMapping("/{diaryIdx}")
    public ResponseEntity<Diary> updateDiary(@PathVariable Integer diaryIdx, @RequestBody DiaryRequest request) {
        try {
        	System.out.println("updateDiary start");
        	Diary diary = Diary.builder()
        					.memberId(request.memberId)
        					.diaryTitle(request.diaryTitle)
        					.diaryContent(request.diaryContent)
        					.file1(request.file1)
        					.file2(request.file2)
        					.file2(request.file2).build();
        	// Service에서 일기 저장 및 AI 분석 요청까지 모두 처리
            Diary updatedDiary = diaryService.updateDiaryAndAnalyze(diary, diaryIdx);
            return new ResponseEntity<>(updatedDiary, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // --- D (Delete: 일기 삭제) ---
    @DeleteMapping("/{diaryIdx}")
    public ResponseEntity<Void> deleteDiary(@PathVariable Integer diaryIdx) {
        diaryService.delete(diaryIdx);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // 204 No Content
    }
    
 
    
    /**
     * 일기 목록을 검색 조건 및 페이징을 적용하여 조회합니다.
     * API Endpoint: GET /api/diaries/list/{memberId}?page=0&size=5&year=2025...
     */
    /**
     * 일기 목록을 검색 조건(RequestBody) 및 페이징(RequestParam)을 적용하여 조회합니다.
     * Endpoint: POST /api/diaries/list/{memberId}?page=0&size=5
     */
    @PostMapping("/list/{memberId}") // ⭐️ POST로 변경
    public ResponseEntity<Page<DiaryResponse>> getDiariesWithPaging(
            @PathVariable Integer memberId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestBody DiarySearchRequest searchRequest) { // ⭐️ @RequestBody로 검색 조건 받음
        
        System.out.println("memberId : " + memberId);
        System.out.println("page : " + page);
        System.out.println("size : " + size);
        System.out.println("year : " + searchRequest.getYear()); // DTO 사용
        System.out.println("keyword : " + searchRequest.getKeyword()); // DTO 사용
        
        // Pageable 객체 생성 (기존과 동일)
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Service 호출 시 DTO에서 값 추출
        Page<DiaryResponse> diariesPage = diaryService.getDiariesWithPagingAndSearch(
                memberId, 
                searchRequest.getYear(), 
                searchRequest.getMonth(), 
                searchRequest.getDay(), 
                searchRequest.getKeyword(), 
                searchRequest.getSelectedMemberId(),
                pageable);
        
        return new ResponseEntity<Page<DiaryResponse>>(diariesPage, HttpStatus.OK);
    }
    
    @GetMapping("/today/{memberId}")
    public ResponseEntity<DiaryResponse> getTodayDiary(
            @PathVariable Integer memberId) {
        
        Optional<DiaryResponse> todayDiary = diaryService.getTodayDiary(memberId);
        
        if (todayDiary.isPresent()) {
            return new ResponseEntity<>(todayDiary.get(), HttpStatus.OK);
        } else {
            // 오늘 작성된 일기가 없으면 404 Not Found 반환
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); 
        }
    }
    
    /**
     * GET /api/diaries/detail/{diaryId}
     * 특정 일기의 상세 정보 및 분석 결과를 조회합니다.
     */
    @GetMapping("/detail/{diaryId}")
    public ResponseEntity<?> getDiaryDetail(@PathVariable("diaryId") Integer diaryId) {
        try {
            DiaryResponse dto = diaryService.getDiaryDetail(diaryId);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            // 일기를 찾지 못한 경우 404 Not Found 반환
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            // 기타 서버 오류 500 Internal Server Error 반환
            System.err.println("일기 상세 로드 실패: " + e.getMessage());
            return ResponseEntity.internalServerError().body("일기 상세 정보를 불러오는 데 실패했습니다.");
        }
    }
}