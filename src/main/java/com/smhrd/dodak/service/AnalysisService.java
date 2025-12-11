package com.smhrd.dodak.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.dodak.controller.DiaryRestController.DiaryResponse;
import com.smhrd.dodak.entity.Analysis;
import com.smhrd.dodak.entity.Diary;
import com.smhrd.dodak.repository.AnalysisRepository;
import com.smhrd.dodak.repository.DiaryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalysisService {

	private final AnalysisRepository analysisRepository;
	private final DiaryRepository diaryRepository;

	// --- C (Create: 분석 결과 등록) ---
	@Transactional
	public Analysis save(Integer diaryIdx, String modelName, BigDecimal anxietyRatio, BigDecimal sadnessRatio,
			BigDecimal joyRatio, BigDecimal angerRatio, BigDecimal regretRatio, BigDecimal hopeRatio,
			BigDecimal neutralityRatio, BigDecimal tirednessRatio, BigDecimal depressionRatio) {

		// 1. FK 유효성 검사 및 엔티티 조회
		Diary diary = diaryRepository.findById(diaryIdx)
				.orElseThrow(() -> new IllegalArgumentException("존재하지 않는 일기(Diary) ID입니다: " + diaryIdx));

		// 1-2. (선택적) 해당 일기에 이미 분석 결과가 있는지 확인 (OneToOne 관계를 가정)
		if (analysisRepository.findByDiary_DiaryIdx(diaryIdx).isPresent()) {
			throw new IllegalStateException("이미 분석 결과가 존재하는 일기입니다. Diary ID: " + diaryIdx);
		}

		// 2. Analysis 엔티티 생성
		Analysis analysis = Analysis.builder().diary(diary).modelName(modelName)

				.anxietyRatio(anxietyRatio).sadnessRatio(sadnessRatio).joyRatio(joyRatio).angerRatio(angerRatio)
				.regretRatio(regretRatio).hopeRatio(hopeRatio).neutralityRatio(neutralityRatio)
				.tirednessRatio(tirednessRatio).depressionRatio(depressionRatio).build();

		// 3. 저장
		return analysisRepository.save(analysis);
	}

	// --- R (Read: 상세 조회) ---
	public Optional<Analysis> findById(Integer analysisIdx) {
		return analysisRepository.findById(analysisIdx);
	}

	// --- R (Read: 특정 일기의 분석 결과 조회) ---
	public Optional<Analysis> findByDiaryId(Integer diaryIdx) {
		return analysisRepository.findByDiary_DiaryIdx(diaryIdx);
	}

	// --- U (Update: 분석 결과 수정) ---
	@Transactional
	public Analysis update(Integer analysisIdx, String modelName, BigDecimal anxietyRatio, BigDecimal sadnessRatio,
			BigDecimal joyRatio, BigDecimal angerRatio, BigDecimal regretRatio, BigDecimal hopeRatio,
			BigDecimal neutralityRatio, BigDecimal tirednessRatio, BigDecimal depressionRatio) {

		Analysis analysis = analysisRepository.findById(analysisIdx)
				.orElseThrow(() -> new IllegalArgumentException("해당 ID의 분석 결과가 없습니다: " + analysisIdx));

		analysis.update(modelName, anxietyRatio, sadnessRatio, joyRatio, angerRatio, regretRatio, hopeRatio,
				neutralityRatio, tirednessRatio, depressionRatio);
		return analysis;
	}

	// --- D (Delete: 분석 결과 삭제) ---
	@Transactional
	public void delete(Integer analysisIdx) {
		analysisRepository.deleteById(analysisIdx);
	}

	public List<DiaryResponse> getMonthlyAnalysisData(Integer memberId, int year, int month) {
		// 1. YYYY-MM 형식의 문자열 생성 (예: 2025-05). month는 0으로 채워 두 자릿수로 만듭니다.
		String yearMonth = String.format("%d-%02d", year, month);
		// 2. DiaryRepository의 @Query를 사용하여 해당 월의 일기와 Analysis 데이터를 JOIN FETCH로 조회
		List<Diary> diaryList = diaryRepository.findByMemberAndMonthWithAnalysis(memberId, yearMonth);
		// 3. 조회된 Diary 엔티티 리스트를 DiaryResponse DTO 리스트로 변환
		// DTO 변환 과정에서 Analysis 정보도 함께 포함됩니다.
		return diaryList.stream()
			.map(DiaryResponse::new)
			.collect(Collectors.toList());
	}
}