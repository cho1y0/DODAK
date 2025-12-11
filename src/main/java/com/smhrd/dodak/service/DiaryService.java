package com.smhrd.dodak.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
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
            // 실제 운영에서는 별도의 큐(Queue)에 넣어 재처리 로직을 구현해야 합니다.
            System.err.println("AI Analysis Failed for Diary ID: " + savedDiary.getDiaryIdx());
            e.printStackTrace();
        }

        return savedDiary;
    }

    /**
     * 외부 AI API에 일기 내용 분석을 요청하는 메서드
     */
    private AnalysisResponse requestPostAiAnalysis(Integer diaryIdx, String diaryContent) {
        // AI API 요청 바디 구성
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("diaryIdx", diaryIdx);
        requestBody.put("diaryContent", diaryContent);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // AI API 호출 (http://192.168.0.9:8000/diary)
        // RestTemplate은 Bean으로 등록되어 있어야 합니다.
        // RestTemplate 호출 시 발생하는 예외(연결 실패 등)는 호출하는 곳에서 처리해야 합니다.
        return restTemplate.postForObject(
            webConfig.getAiApiUrl(), 
            entity, 
            AnalysisResponse.class // 응답 DTO 클래스
        );
    }
    
    /**
     * 외부 AI API에 일기 내용 분석을 요청하는 메서드 (GET 방식)
     */
    private AnalysisResponse requestGetAiAnalysis(Integer diaryIdx, String diaryContent) {
        
        // 1. URL과 쿼리 파라미터를 UriComponentsBuilder를 사용해 구성합니다.
        // 예: http://192.168.0.9:8000/diary?diaryIdx=10&diaryContent=오늘 기분이...
        String url = UriComponentsBuilder.fromHttpUrl(webConfig.getAiApiUrl())                
                .queryParam("s", diaryContent) // URL 인코딩이 자동으로 처리됩니다.
                .toUriString();

        System.out.println("AI API GET Request URL: " + url);
        
        // 2. GET 요청을 실행하고 AnalysisResponse 타입으로 응답을 받습니다.
        // GET 요청은 요청 본문을 사용하지 않으므로 HttpEntity는 null입니다.
        ResponseEntity<AnalysisResponse> responseEntity = restTemplate.exchange(
            url,
            HttpMethod.GET, // GET 방식으로 요청
            null, 
            AnalysisResponse.class
        );
        
        if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
            return responseEntity.getBody();
        } else {
            // 요청 실패 또는 응답 본문 부재 시 예외 처리
            String errorMsg = String.format("AI API GET 요청 실패. Status: %s", responseEntity.getStatusCode());
            throw new RuntimeException(errorMsg);
        }
    }
    
    /**
     * 외부 AI API에 일기 내용 분석을 요청하는 메서드 (GET 방식)
     * * [테스트 모드]: 10초 대기 후 랜덤한 감정 비율이 포함된 더미 데이터를 반환합니다.
     */
    private AnalysisResponse requestTestAiAnalysis(Integer diaryIdx, String diaryContent) {
        
        System.out.println("TEST MODE: AI 분석 요청 (10초 대기 후 랜덤 데이터 반환)");

        try {
            // 1. 10초 (10000ms) 대기
            Thread.sleep(10000); 
            System.out.println("TEST MODE: 10초 대기 완료.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("AI 분석 대기 중 인터럽트 발생", e);
        }

        // 2. 랜덤 비율 생성 (합계가 100이 되도록)
        Random random = new Random();
        
        // 5가지 감정의 기본 비율을 1부터 100 사이에서 랜덤하게 생성
        List<Integer> rawRatios = random.ints(5, 1, 100).boxed().collect(Collectors.toList());
        int sumOfRatios = rawRatios.stream().mapToInt(Integer::intValue).sum();

        // 3. AnalysisResponse 객체에 값 채우기
        // AnalysisResponse DTO는 getter/setter 및 필드가 정의되어 있어야 합니다.
        AnalysisResponse response = new AnalysisResponse();
        response.setModelName("skt/kobert-base-v1");        
        
        // 비율을 100으로 정규화하고 소수점 1자리까지 반올림하여 설정
        // 순서: Anger, Anxiety, Sadness, Joy, Regret
        response.setAnger(normalizeAndScale(rawRatios.get(0), sumOfRatios));
        response.setAnxiety(normalizeAndScale(rawRatios.get(1), sumOfRatios));
        response.setSadness(normalizeAndScale(rawRatios.get(2), sumOfRatios));
        response.setJoy(normalizeAndScale(rawRatios.get(3), sumOfRatios));
        response.setRegret(normalizeAndScale(rawRatios.get(4), sumOfRatios));
        
        // Note: 정규화 과정에서 소수점 반올림 때문에 최종 합계가 정확히 100.0이 아닐 수 있습니다.
        
        return response;
    }
    
    /**
     * 비율을 정규화하고 소수점 첫째 자리까지 반올림하여 BigDecimal로 반환
     */
    private BigDecimal normalizeAndScale(int ratio, int sum) {
        if (sum == 0) return BigDecimal.ZERO;
        
        // (현재 비율 / 전체 합) * 100 계산
        return new BigDecimal(ratio)
                .multiply(new BigDecimal("100"))
                .divide(new BigDecimal(sum), 1, RoundingMode.HALF_UP);
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
    @Transactional // 두 단계의 DB 작업(일기 저장, 분석 결과 저장)을 트랜잭션으로 묶습니다.
	public Diary updateDiaryAndAnalyze(Diary diaryRequest, Integer diaryIdx) {
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
    	diary.setDiaryIdx(diaryIdx);
    	System.out.println("diary : " + diary.toString());
    	
        Diary savedDiary = diaryRepository.save(diary);
        System.out.println("savedDiary : " + savedDiary.toString());
        
        // 2. AI 분석 요청 (비동기 처리로 분리하는 것이 이상적일 수 있으나, 여기서는 동기적으로 처리)
        try {
            AnalysisResponse analysisResponse = requestGetAiAnalysis(
                savedDiary.getDiaryIdx(),
                savedDiary.getDiaryContent()
            );

            // 3. 분석 결과 DB 저장
            Analysis analysisResult = Analysis.createAnalysis(savedDiary, analysisResponse);
            Optional<Analysis> analysis = analysisRepository.findByDiary_DiaryIdx(diaryIdx);
            diary.setDiaryIdx(diaryIdx);
        	System.out.println(analysisResult.toString());
        	
            if(analysis!=null) {
            	
            	analysisResult.setAnalysisIdx(analysis.get().getAnalysisIdx());
            }
            System.out.println("analysisResult : " + analysisResult.toString());
            Analysis analysisUpdated = analysisRepository.save(analysisResult);
            System.out.println("analysisUpdated : " + analysisUpdated.toString());
        } catch (Exception e) {
            // AI API 호출 또는 결과 저장 실패 시, 일기 저장은 성공했으므로 롤백하지 않고 로그만 남김
            // 실제 운영에서는 별도의 큐(Queue)에 넣어 재처리 로직을 구현해야 합니다.
            System.err.println("AI Analysis Failed for Diary ID: " + savedDiary.getDiaryIdx());
            e.printStackTrace();
        }

        return savedDiary;
	}
    
 // 🚨 실제 DB 조회 로직 대신 Mock 데이터를 반환하는 메서드입니다.
    // 실제 구현 시 DiaryRepository를 주입받아 사용해야 합니다.
    public List<DiaryResponse> getMonthlyAnalysisData(Integer memberId, int year, int month) {
        
        // --- Mock Data 생성 로직 ---
        List<DiaryResponse> mockData = new ArrayList<>();
        
        String yearMonth = year+"-"+month;
        List<Diary> diaryList = diaryRepository.findByMemberAndMonthWithAnalysis(memberId, yearMonth);
        
        
        return mockData;
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