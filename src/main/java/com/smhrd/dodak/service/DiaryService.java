package com.smhrd.dodak.service;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.smhrd.dodak.config.WebConfig;
import com.smhrd.dodak.controller.DiaryRestController.DiaryResponse;
import com.smhrd.dodak.entity.Analysis;
import com.smhrd.dodak.entity.AnalysisResponse;
import com.smhrd.dodak.entity.Diary;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.repository.AnalysisRepository;
import com.smhrd.dodak.repository.DiaryRepository;
import com.smhrd.dodak.repository.MemberRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final MemberRepository memberRepository;    
    private final AnalysisRepository analysisRepository;
    private final RestTemplate restTemplate;
    
    @Autowired
	WebConfig webConfig;

    // --- C (Create: 일기 작성) ---
    @Transactional
    public Diary writeDiary(Integer memberId, String title, String content, 
                            String file1, String file2, String file3) {
        
        // 1. FK 유효성 검사 및 Member 엔티티 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원(Member) ID입니다: " + memberId));

        // 2. Diary 엔티티 생성
        Diary diary = Diary.builder()
                .member(member) // Member 객체 연결
                .diaryTitle(title)
                .diaryContent(content)
                .file1(file1)
                .file2(file2)
                .file3(file3)
                .build();

        // 3. 저장
        return diaryRepository.save(diary);
    }

    // --- R (Read: 단일 일기 조회) ---
    public Optional<Diary> findById(Integer diaryIdx) {
        return diaryRepository.findById(diaryIdx);
    }

    // --- R (Read: 특정 회원의 전체 일기 목록 조회) ---
    public List<Diary> findAllByMemberId(Integer memberId) {
        return diaryRepository.findByMember_Id(memberId);
    }

    // --- U (Update: 일기 수정) ---
    @Transactional
    public Diary update(Integer diaryIdx, String newTitle, String newContent, 
                        String newFile1, String newFile2, String newFile3) {
                        
        Diary diary = diaryRepository.findById(diaryIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 일기가 없습니다: " + diaryIdx));

        // Entity 내부의 update 메서드를 호출하여 데이터 변경
        diary.update(newTitle, newContent, newFile1, newFile2, newFile3);
        
        // Dirty Checking에 의해 트랜잭션 종료 시 자동 UPDATE
        return diary;
    }

    // --- D (Delete: 일기 삭제) ---
    @Transactional
    public void delete(Integer diaryIdx) {
        diaryRepository.deleteById(diaryIdx);
    }
    
    @Transactional // 두 단계의 DB 작업(일기 저장, 분석 결과 저장)을 트랜잭션으로 묶습니다.
    public Diary writeDiaryAndAnalyze(Diary diaryRequest) {
    	Integer memberId = diaryRequest.getMemberId();
    	Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원(Member) ID입니다: " + memberId));
        // 1. 일기 저장
        // TODO: memberId를 바탕으로 실제 Member 객체를 찾아 Diary 객체에 설정하는 로직 필요
    	Diary diary = Diary.builder()
    			           .member(member)
    			           .diaryTitle(diaryRequest.getDiaryTitle())
    			           .diaryContent(diaryRequest.getDiaryContent())
    			           .file1(diaryRequest.getFile1())
    			           .file2(diaryRequest.getFile2())
    			           .file3(diaryRequest.getFile3()).build();
        Diary savedDiary = diaryRepository.save(diary); 

        // 2. AI 분석 요청 (비동기 처리로 분리하는 것이 이상적일 수 있으나, 여기서는 동기적으로 처리)
        try {
            AnalysisResponse analysisResponse = requestGetAiAnalysis(
                savedDiary.getDiaryIdx(),
                savedDiary.getDiaryContent()
            );

            // 3. 분석 결과 DB 저장
            Analysis analysisResult = Analysis.createAnalysis(savedDiary, analysisResponse);
            analysisRepository.save(analysisResult);
            
        } catch (Exception e) {
            // AI API 호출 또는 결과 저장 실패 시, 일기 저장은 성공했으므로 롤백하지 않고 로그만 남김
            log.error("AI Analysis Failed for Diary ID: {}", savedDiary.getDiaryIdx(), e);
        }

        return savedDiary;
    }

    /**
     * 외부 AI API에 일기 내용 분석을 요청하는 메서드 (GET 방식)
     */
    private AnalysisResponse requestGetAiAnalysis(Integer diaryIdx, String diaryContent) {
        String url = UriComponentsBuilder.fromHttpUrl(webConfig.getAiApiUrl() + "/diary")
                .queryParam("s", diaryContent)
                .toUriString();

        log.debug("AI API GET Request URL: {}", url);

        ResponseEntity<AnalysisResponse> responseEntity = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                AnalysisResponse.class
        );

        if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
            return responseEntity.getBody();
        } else {
            String errorMsg = String.format("AI API GET 요청 실패. Status: %s", responseEntity.getStatusCode());
            throw new RuntimeException(errorMsg);
        }
    }

    public Page<DiaryResponse> getDiariesWithPagingAndSearch(
            Integer memberId, 
            String year, 
            String month, 
            String day, 
            String keyword, 
            Integer selectedMemberId, // ⭐️ 추가
            Pageable pageable) {
    	
        
        // 1. Querydsl 구현체를 통해 검색 및 페이징된 Page<Diary>를 조회
        Page<Diary> diaryPage = diaryRepository.searchDiaries(
            memberId, year, month, day, keyword, selectedMemberId, pageable
        );
        
        // 2. Page<Diary>를 Page<DiaryResponse>로 변환하여 반환
        // DTO 변환 과정에서 Hibernate 프록시 문제가 해결됩니다.
        return diaryPage.map(DiaryResponse::new);
    }
    
    public Optional<DiaryResponse> getTodayDiary(Integer memberId) {
        // 1. 현재 날짜의 시작 시간과 끝 시간을 계산합니다.
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        
     // 1. FK 유효성 검사 및 Member 엔티티 조회
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원(Member) ID입니다: " + memberId));

        // 2. Repository에서 해당 기간 내의 일기를 createdAt 내림차순으로 1개만 조회합니다.
        // DiaryRepository에 findTop1ByMemberIdAndCreatedAtBetweenOrderByCreatedAtDesc 같은 메서드를 추가해야 합니다.
        Optional<Diary> todayDiary = diaryRepository.findTop1ByMemberAndCreatedAtBetweenOrderByCreatedAtDesc(
        	member, 
            Timestamp.valueOf(startOfDay), 
            Timestamp.valueOf(endOfDay)
        );
        
        // 3. Entity를 DTO로 변환하여 반환합니다.
        return todayDiary.map(DiaryResponse::new);
    }
    @Transactional
    public Diary updateDiaryAndAnalyze(Diary diaryRequest, Integer diaryIdx) {
        Integer memberId = diaryRequest.getMemberId();
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원(Member) ID입니다: " + memberId));

        Diary diary = Diary.builder()
                .member(member)
                .diaryTitle(diaryRequest.getDiaryTitle())
                .diaryContent(diaryRequest.getDiaryContent())
                .file1(diaryRequest.getFile1())
                .file2(diaryRequest.getFile2())
                .file3(diaryRequest.getFile3()).build();
        diary.setDiaryIdx(diaryIdx);
        log.debug("Updating diary: {}", diary);

        Diary savedDiary = diaryRepository.save(diary);
        log.debug("Saved diary: {}", savedDiary);

        try {
            AnalysisResponse analysisResponse = requestGetAiAnalysis(
                    savedDiary.getDiaryIdx(),
                    savedDiary.getDiaryContent()
            );

            Analysis analysisResult = Analysis.createAnalysis(savedDiary, analysisResponse);
            Optional<Analysis> existingAnalysis = analysisRepository.findByDiary_DiaryIdx(diaryIdx);

            if (existingAnalysis.isPresent()) {
                analysisResult.setAnalysisIdx(existingAnalysis.get().getAnalysisIdx());
            }
            log.debug("Analysis result: {}", analysisResult);

            Analysis analysisUpdated = analysisRepository.save(analysisResult);
            log.debug("Analysis updated: {}", analysisUpdated);
        } catch (Exception e) {
            log.error("AI Analysis Failed for Diary ID: {}", savedDiary.getDiaryIdx(), e);
        }

        return savedDiary;
    }
    
    /**
     * 특정 회원의 월별 분석 데이터를 조회합니다.
     */
    public List<DiaryResponse> getMonthlyAnalysisData(Integer memberId, int year, int month) {
        String yearMonth = String.format("%d-%02d", year, month);
        List<Diary> diaryList = diaryRepository.findByMemberAndMonthWithAnalysis(memberId, yearMonth);
        return diaryList.stream()
                .map(DiaryResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * 일기 식별자로 상세 정보(일기, 분석, 작성자)를 조회합니다.
     * @param diaryIdx 조회할 일기 ID
     * @return 일기 상세 정보 DiaryResponse DTO
     * @throws IllegalArgumentException 일기를 찾지 못했을 경우
     */
    public DiaryResponse getDiaryDetail(Integer diaryIdx) {
        // findByIdWithAnalysisAndMember 메서드를 사용해 Member와 Analysis를 함께 로딩
        Diary diary = diaryRepository.findByIdWithAnalysisAndMember(diaryIdx)
            .orElseThrow(() -> new IllegalArgumentException("Diary not found with id: " + diaryIdx));
        
        // DTO 생성자를 통해 엔티티의 데이터를 DTO로 변환
        return new DiaryResponse(diary);
    }
}