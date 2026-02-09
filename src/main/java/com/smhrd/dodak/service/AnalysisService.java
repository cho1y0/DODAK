package com.smhrd.dodak.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smhrd.dodak.controller.DiaryRestController.DiaryResponse;
import com.smhrd.dodak.entity.Analysis;
import com.smhrd.dodak.entity.Arrange;
import com.smhrd.dodak.entity.DashboardStatsResponse;
import com.smhrd.dodak.entity.Diary;
import com.smhrd.dodak.entity.Doctor;
import com.smhrd.dodak.entity.Member;
import com.smhrd.dodak.entity.PatientStatsResponse;
import com.smhrd.dodak.repository.AnalysisRepository;
import com.smhrd.dodak.repository.ArrangeRepository;
import com.smhrd.dodak.repository.DiaryRepository;
import com.smhrd.dodak.repository.DoctorRepository;
import com.smhrd.dodak.repository.MemberRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalysisService {

	private final AnalysisRepository analysisRepository;
	private final DiaryRepository diaryRepository;
	private final MemberRepository memberRepository;
	private final DoctorRepository doctorRepository;
	private final ArrangeRepository arrangeRepository;

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

	/**
	 * 환자의 월간 통계를 계산하여 반환합니다.
	 * @param memberId 환자의 Member ID
	 * @param year 조회 연도
	 * @param month 조회 월
	 * @return 집계된 통계 데이터
	 */
	public PatientStatsResponse getPatientMonthlyStats(Integer memberId, int year, int month) {
		// 1. 회원 정보 조회
		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + memberId));

		// 2. 해당 월 일기 데이터 조회
		String yearMonth = String.format("%d-%02d", year, month);
		List<Diary> diaryList = diaryRepository.findByMemberAndMonthWithAnalysis(memberId, yearMonth);

		// 데이터가 없는 경우 빈 응답 반환
		if (diaryList.isEmpty()) {
			return PatientStatsResponse.builder()
					.memberId(memberId)
					.memberName(member.getName())
					.year(year)
					.month(month)
					.diaryCount(0)
					.emotionAverages(createEmptyAverages())
					.dailyEmotions(new ArrayList<>())
					.topNegativeDays(new ArrayList<>())
					.indicators(createDefaultIndicators())
					.build();
		}

		// 3. 감정 평균 계산
		PatientStatsResponse.EmotionAverages averages = calculateEmotionAverages(diaryList);

		// 4. 일별 감정 추이 계산
		List<PatientStatsResponse.DailyEmotion> dailyEmotions = calculateDailyEmotions(diaryList);

		// 5. 가장 부정적인 날 TOP 3 추출
		List<PatientStatsResponse.NegativeDayInfo> topNegativeDays = findTopNegativeDays(diaryList, 3);

		// 6. 종합 지표 계산
		PatientStatsResponse.OverallIndicators indicators = calculateOverallIndicators(averages);

		return PatientStatsResponse.builder()
				.memberId(memberId)
				.memberName(member.getName())
				.year(year)
				.month(month)
				.diaryCount(diaryList.size())
				.emotionAverages(averages)
				.dailyEmotions(dailyEmotions)
				.topNegativeDays(topNegativeDays)
				.indicators(indicators)
				.build();
	}

	/**
	 * 감정 비율 평균 계산
	 */
	private PatientStatsResponse.EmotionAverages calculateEmotionAverages(List<Diary> diaryList) {
		BigDecimal count = BigDecimal.valueOf(diaryList.size());
		BigDecimal sumAnxiety = BigDecimal.ZERO;
		BigDecimal sumSadness = BigDecimal.ZERO;
		BigDecimal sumJoy = BigDecimal.ZERO;
		BigDecimal sumAnger = BigDecimal.ZERO;
		BigDecimal sumRegret = BigDecimal.ZERO;
		BigDecimal sumHope = BigDecimal.ZERO;
		BigDecimal sumNeutrality = BigDecimal.ZERO;
		BigDecimal sumTiredness = BigDecimal.ZERO;
		BigDecimal sumDepression = BigDecimal.ZERO;

		for (Diary diary : diaryList) {
			Analysis analysis = diary.getAnalysis();
			if (analysis != null) {
				sumAnxiety = sumAnxiety.add(nullToZero(analysis.getAnxietyRatio()));
				sumSadness = sumSadness.add(nullToZero(analysis.getSadnessRatio()));
				sumJoy = sumJoy.add(nullToZero(analysis.getJoyRatio()));
				sumAnger = sumAnger.add(nullToZero(analysis.getAngerRatio()));
				sumRegret = sumRegret.add(nullToZero(analysis.getRegretRatio()));
				sumHope = sumHope.add(nullToZero(analysis.getHopeRatio()));
				sumNeutrality = sumNeutrality.add(nullToZero(analysis.getNeutralityRatio()));
				sumTiredness = sumTiredness.add(nullToZero(analysis.getTirednessRatio()));
				sumDepression = sumDepression.add(nullToZero(analysis.getDepressionRatio()));
			}
		}

		return PatientStatsResponse.EmotionAverages.builder()
				.anxiety(divide(sumAnxiety, count))
				.sadness(divide(sumSadness, count))
				.joy(divide(sumJoy, count))
				.anger(divide(sumAnger, count))
				.regret(divide(sumRegret, count))
				.hope(divide(sumHope, count))
				.neutrality(divide(sumNeutrality, count))
				.tiredness(divide(sumTiredness, count))
				.depression(divide(sumDepression, count))
				.build();
	}

	/**
	 * 일별 감정 추이 계산
	 */
	private List<PatientStatsResponse.DailyEmotion> calculateDailyEmotions(List<Diary> diaryList) {
		return diaryList.stream()
				.filter(diary -> diary.getAnalysis() != null)
				.map(diary -> {
					Analysis a = diary.getAnalysis();
					BigDecimal happiness = nullToZero(a.getJoyRatio()).add(nullToZero(a.getHopeRatio()));
					BigDecimal sadnessIndex = nullToZero(a.getSadnessRatio())
							.add(nullToZero(a.getDepressionRatio()))
							.add(nullToZero(a.getAnxietyRatio()));

					return PatientStatsResponse.DailyEmotion.builder()
							.day(diary.getCreatedAt().toLocalDateTime().getDayOfMonth())
							.date(diary.getCreatedAt().toLocalDateTime().toLocalDate().toString())
							.happiness(happiness)
							.sadnessIndex(sadnessIndex)
							.dominantEmotion(findDominantEmotion(a))
							.build();
				})
				.sorted(Comparator.comparing(PatientStatsResponse.DailyEmotion::getDay))
				.collect(Collectors.toList());
	}

	/**
	 * 가장 부정적인 날 TOP N 추출
	 */
	private List<PatientStatsResponse.NegativeDayInfo> findTopNegativeDays(List<Diary> diaryList, int limit) {
		return diaryList.stream()
				.filter(diary -> diary.getAnalysis() != null)
				.map(diary -> {
					Analysis a = diary.getAnalysis();
					BigDecimal negativeScore = nullToZero(a.getSadnessRatio())
							.add(nullToZero(a.getDepressionRatio()))
							.add(nullToZero(a.getAnxietyRatio()))
							.add(nullToZero(a.getAngerRatio()));

					// 가장 높은 부정 감정 찾기
					String dominantNegative = "슬픔";
					BigDecimal maxRatio = nullToZero(a.getSadnessRatio());

					if (nullToZero(a.getDepressionRatio()).compareTo(maxRatio) > 0) {
						dominantNegative = "우울";
						maxRatio = a.getDepressionRatio();
					}
					if (nullToZero(a.getAnxietyRatio()).compareTo(maxRatio) > 0) {
						dominantNegative = "불안";
						maxRatio = a.getAnxietyRatio();
					}
					if (nullToZero(a.getAngerRatio()).compareTo(maxRatio) > 0) {
						dominantNegative = "분노";
						maxRatio = a.getAngerRatio();
					}

					return PatientStatsResponse.NegativeDayInfo.builder()
							.diaryIdx(diary.getDiaryIdx())
							.date(diary.getCreatedAt().toLocalDateTime().toLocalDate().toString())
							.title(diary.getDiaryTitle())
							.negativeScore(negativeScore)
							.dominantNegativeEmotion(dominantNegative)
							.dominantNegativeRatio(maxRatio)
							.build();
				})
				.sorted((a, b) -> b.getNegativeScore().compareTo(a.getNegativeScore()))
				.limit(limit)
				.collect(Collectors.toList());
	}

	/**
	 * 종합 지표 계산
	 */
	private PatientStatsResponse.OverallIndicators calculateOverallIndicators(
			PatientStatsResponse.EmotionAverages averages) {

		// 행복 지수: (기쁨 + 희망) / 2 * 100 / 최대값
		BigDecimal happinessIndex = averages.getJoy().add(averages.getHope())
				.divide(BigDecimal.valueOf(2), 1, RoundingMode.HALF_UP);

		// 우울 지수: (슬픔 + 우울 + 불안) / 3 * 100 / 최대값
		BigDecimal depressionIndex = averages.getSadness()
				.add(averages.getDepression())
				.add(averages.getAnxiety())
				.divide(BigDecimal.valueOf(3), 1, RoundingMode.HALF_UP);

		// 단계 계산 (0~20: 1단계, 20~40: 2단계, ...)
		int happinessLevel = calculateLevel(happinessIndex);
		int depressionLevel = calculateLevel(depressionIndex);

		// 상태 텍스트
		String happinessStatus = getHappinessStatus(happinessLevel);
		String depressionStatus = getDepressionStatus(depressionLevel);

		// 추천 메시지
		String recommendation = generateRecommendation(happinessLevel, depressionLevel);

		return PatientStatsResponse.OverallIndicators.builder()
				.happinessIndex(happinessIndex)
				.depressionIndex(depressionIndex)
				.happinessLevel(happinessLevel)
				.depressionLevel(depressionLevel)
				.happinessStatus(happinessStatus)
				.depressionStatus(depressionStatus)
				.recommendation(recommendation)
				.build();
	}

	/**
	 * 지배적 감정 찾기
	 */
	private String findDominantEmotion(Analysis a) {
		BigDecimal max = BigDecimal.ZERO;
		String dominant = "중립";

		BigDecimal[] values = {
				nullToZero(a.getAnxietyRatio()),
				nullToZero(a.getSadnessRatio()),
				nullToZero(a.getJoyRatio()),
				nullToZero(a.getAngerRatio()),
				nullToZero(a.getRegretRatio()),
				nullToZero(a.getHopeRatio()),
				nullToZero(a.getNeutralityRatio()),
				nullToZero(a.getTirednessRatio()),
				nullToZero(a.getDepressionRatio())
		};
		String[] names = {"불안", "슬픔", "기쁨", "분노", "후회", "희망", "중립", "피로", "우울"};

		for (int i = 0; i < values.length; i++) {
			if (values[i].compareTo(max) > 0) {
				max = values[i];
				dominant = names[i];
			}
		}
		return dominant;
	}

	private int calculateLevel(BigDecimal value) {
		if (value.compareTo(BigDecimal.valueOf(20)) < 0) return 1;
		if (value.compareTo(BigDecimal.valueOf(40)) < 0) return 2;
		if (value.compareTo(BigDecimal.valueOf(60)) < 0) return 3;
		if (value.compareTo(BigDecimal.valueOf(80)) < 0) return 4;
		return 5;
	}

	private String getHappinessStatus(int level) {
		switch (level) {
			case 1: return "매우 낮음 😢";
			case 2: return "낮음 😐";
			case 3: return "보통 😊";
			case 4: return "좋음 😄";
			case 5: return "매우 좋음 🥰";
			default: return "측정 불가";
		}
	}

	private String getDepressionStatus(int level) {
		switch (level) {
			case 1: return "양호 😊";
			case 2: return "관심 필요 😐";
			case 3: return "주의 😟";
			case 4: return "경고 😥";
			case 5: return "심각 🚨";
			default: return "측정 불가";
		}
	}

	private String generateRecommendation(int happinessLevel, int depressionLevel) {
		if (depressionLevel >= 4) {
			return "🚨 집중 상담이 필요합니다. 환자와 심층 면담을 권장합니다.";
		} else if (depressionLevel >= 3) {
			return "😟 주의가 필요한 상태입니다. 정기 상담을 통해 모니터링하세요.";
		} else if (happinessLevel >= 4) {
			return "😊 전반적으로 긍정적인 상태입니다. 현재 상태를 유지하도록 격려해 주세요.";
		} else {
			return "📋 안정적인 상태입니다. 지속적인 관찰을 권장합니다.";
		}
	}

	private BigDecimal nullToZero(BigDecimal value) {
		return value != null ? value : BigDecimal.ZERO;
	}

	private BigDecimal divide(BigDecimal dividend, BigDecimal divisor) {
		if (divisor.compareTo(BigDecimal.ZERO) == 0) {
			return BigDecimal.ZERO;
		}
		return dividend.divide(divisor, 1, RoundingMode.HALF_UP);
	}

	private PatientStatsResponse.EmotionAverages createEmptyAverages() {
		return PatientStatsResponse.EmotionAverages.builder()
				.anxiety(BigDecimal.ZERO)
				.sadness(BigDecimal.ZERO)
				.joy(BigDecimal.ZERO)
				.anger(BigDecimal.ZERO)
				.regret(BigDecimal.ZERO)
				.hope(BigDecimal.ZERO)
				.neutrality(BigDecimal.ZERO)
				.tiredness(BigDecimal.ZERO)
				.depression(BigDecimal.ZERO)
				.build();
	}

	private PatientStatsResponse.OverallIndicators createDefaultIndicators() {
		return PatientStatsResponse.OverallIndicators.builder()
				.happinessIndex(BigDecimal.ZERO)
				.depressionIndex(BigDecimal.ZERO)
				.happinessLevel(0)
				.depressionLevel(0)
				.happinessStatus("데이터 없음")
				.depressionStatus("데이터 없음")
				.recommendation("📋 이번 달 작성된 일기가 없습니다.")
				.build();
	}

	// ==================== 대시보드 통계 메서드 ====================

	/**
	 * 의사 대시보드 통계를 조회합니다.
	 * @param memberId 의사의 Member ID
	 * @return 대시보드 통계 데이터
	 */
	public DashboardStatsResponse getDashboardStats(Integer memberId) {
		// 1. 의사 정보 조회
		Member member = memberRepository.findById(memberId)
				.orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + memberId));

		Doctor doctor = doctorRepository.findByMember(member)
				.orElseThrow(() -> new IllegalArgumentException("의사 정보를 찾을 수 없습니다. Member ID: " + memberId));

		// 2. 배정된 환자 ID 목록 조회
		List<Integer> assignedPatientIds = arrangeRepository.findAssignedPatientIdsByDoctorId(doctor.getDoctIdx());

		if (assignedPatientIds.isEmpty()) {
			return createEmptyDashboardStats();
		}

		// 3. 배정된 환자 정보 조회
		List<Member> assignedPatients = memberRepository.findAllById(assignedPatientIds);

		// 4. 중증 환자 필터링
		List<Member> severePatients = assignedPatients.stream()
				.filter(p -> p.getPatientStatus() != null && p.getPatientStatus() == 2)
				.collect(Collectors.toList());

		// 5. 이번 달 일기 데이터 조회
		LocalDate now = LocalDate.now();
		String currentYearMonth = now.format(DateTimeFormatter.ofPattern("yyyy-MM"));

		int monthlyDiaryCount = 0;
		BigDecimal totalJoy = BigDecimal.ZERO;
		BigDecimal totalHope = BigDecimal.ZERO;
		BigDecimal totalAnxiety = BigDecimal.ZERO;
		BigDecimal totalSadness = BigDecimal.ZERO;
		BigDecimal totalAnger = BigDecimal.ZERO;
		BigDecimal totalRegret = BigDecimal.ZERO;
		BigDecimal totalNeutrality = BigDecimal.ZERO;
		BigDecimal totalTiredness = BigDecimal.ZERO;
		BigDecimal totalDepression = BigDecimal.ZERO;
		int analysisCount = 0;

		for (Integer patientId : assignedPatientIds) {
			List<Diary> diaries = diaryRepository.findByMemberAndMonthWithAnalysis(patientId, currentYearMonth);
			monthlyDiaryCount += diaries.size();

			for (Diary diary : diaries) {
				Analysis a = diary.getAnalysis();
				if (a != null) {
					totalJoy = totalJoy.add(nullToZero(a.getJoyRatio()));
					totalHope = totalHope.add(nullToZero(a.getHopeRatio()));
					totalAnxiety = totalAnxiety.add(nullToZero(a.getAnxietyRatio()));
					totalSadness = totalSadness.add(nullToZero(a.getSadnessRatio()));
					totalAnger = totalAnger.add(nullToZero(a.getAngerRatio()));
					totalRegret = totalRegret.add(nullToZero(a.getRegretRatio()));
					totalNeutrality = totalNeutrality.add(nullToZero(a.getNeutralityRatio()));
					totalTiredness = totalTiredness.add(nullToZero(a.getTirednessRatio()));
					totalDepression = totalDepression.add(nullToZero(a.getDepressionRatio()));
					analysisCount++;
				}
			}
		}

		// 6. 평균 계산
		DashboardStatsResponse.EmotionSummary emotionSummary;
		BigDecimal avgHappiness = BigDecimal.ZERO;

		if (analysisCount > 0) {
			BigDecimal count = BigDecimal.valueOf(analysisCount);
			BigDecimal avgJoy = divide(totalJoy, count);
			BigDecimal avgHope = divide(totalHope, count);
			avgHappiness = avgJoy.add(avgHope).divide(BigDecimal.valueOf(2), 1, RoundingMode.HALF_UP);

			emotionSummary = DashboardStatsResponse.EmotionSummary.builder()
					.anxiety(divide(totalAnxiety, count))
					.sadness(divide(totalSadness, count))
					.joy(avgJoy)
					.anger(divide(totalAnger, count))
					.regret(divide(totalRegret, count))
					.hope(avgHope)
					.neutrality(divide(totalNeutrality, count))
					.tiredness(divide(totalTiredness, count))
					.depression(divide(totalDepression, count))
					.build();
		} else {
			emotionSummary = DashboardStatsResponse.EmotionSummary.builder()
					.anxiety(BigDecimal.ZERO).sadness(BigDecimal.ZERO).joy(BigDecimal.ZERO)
					.anger(BigDecimal.ZERO).regret(BigDecimal.ZERO).hope(BigDecimal.ZERO)
					.neutrality(BigDecimal.ZERO).tiredness(BigDecimal.ZERO).depression(BigDecimal.ZERO)
					.build();
		}

		// 7. 최근 7일 일기 작성 추이
		List<DashboardStatsResponse.DailyDiaryCount> weeklyDiaryCounts = calculateWeeklyDiaryCounts(assignedPatientIds);

		// 8. 월별 감정 추이 (최근 6개월)
		List<DashboardStatsResponse.MonthlyEmotionTrend> monthlyTrends = calculateMonthlyTrends(assignedPatientIds);

		// 9. 최근 일기 활동
		List<DashboardStatsResponse.RecentDiaryActivity> recentActivities = getRecentActivities(assignedPatientIds, 10);

		// 10. 중증 환자 상세 정보
		List<DashboardStatsResponse.SeverePatientInfo> severePatientDetails = getSeverePatientDetails(severePatients, currentYearMonth);

		return DashboardStatsResponse.builder()
				.totalPatients(assignedPatients.size())
				.severePatients(severePatients.size())
				.monthlyDiaryCount(monthlyDiaryCount)
				.avgHappinessIndex(avgHappiness)
				.emotionSummary(emotionSummary)
				.weeklyDiaryCounts(weeklyDiaryCounts)
				.monthlyTrends(monthlyTrends)
				.recentActivities(recentActivities)
				.severePatientDetails(severePatientDetails)
				.build();
	}

	/**
	 * 최근 7일 일기 작성 추이 계산
	 */
	private List<DashboardStatsResponse.DailyDiaryCount> calculateWeeklyDiaryCounts(List<Integer> patientIds) {
		List<DashboardStatsResponse.DailyDiaryCount> result = new ArrayList<>();
		LocalDate today = LocalDate.now();

		String[] dayLabels = {"오늘", "어제", "2일 전", "3일 전", "4일 전", "5일 전", "6일 전"};

		for (int i = 0; i < 7; i++) {
			LocalDate date = today.minusDays(i);
			java.sql.Timestamp startOfDay = java.sql.Timestamp.valueOf(date.atStartOfDay());
			java.sql.Timestamp endOfDay = java.sql.Timestamp.valueOf(date.plusDays(1).atStartOfDay());

			List<Diary> diaries = diaryRepository.findByMemberIdsAndDateRange(patientIds, startOfDay, endOfDay);

			result.add(DashboardStatsResponse.DailyDiaryCount.builder()
					.date(date.toString())
					.dayLabel(dayLabels[i])
					.count(diaries.size())
					.build());
		}

		// 오래된 순서로 정렬 (차트 표시용)
		java.util.Collections.reverse(result);
		return result;
	}

	/**
	 * 월별 감정 추이 계산 (최근 6개월)
	 */
	private List<DashboardStatsResponse.MonthlyEmotionTrend> calculateMonthlyTrends(List<Integer> patientIds) {
		List<DashboardStatsResponse.MonthlyEmotionTrend> result = new ArrayList<>();
		LocalDate today = LocalDate.now();

		for (int i = 5; i >= 0; i--) {
			LocalDate targetMonth = today.minusMonths(i);
			int year = targetMonth.getYear();
			int month = targetMonth.getMonthValue();
			String yearMonth = String.format("%d-%02d", year, month);

			BigDecimal totalJoy = BigDecimal.ZERO;
			BigDecimal totalHope = BigDecimal.ZERO;
			BigDecimal totalSadness = BigDecimal.ZERO;
			BigDecimal totalDepression = BigDecimal.ZERO;
			BigDecimal totalAnxiety = BigDecimal.ZERO;
			int count = 0;
			int diaryCount = 0;

			for (Integer patientId : patientIds) {
				List<Diary> diaries = diaryRepository.findByMemberAndMonthWithAnalysis(patientId, yearMonth);
				diaryCount += diaries.size();

				for (Diary diary : diaries) {
					Analysis a = diary.getAnalysis();
					if (a != null) {
						totalJoy = totalJoy.add(nullToZero(a.getJoyRatio()));
						totalHope = totalHope.add(nullToZero(a.getHopeRatio()));
						totalSadness = totalSadness.add(nullToZero(a.getSadnessRatio()));
						totalDepression = totalDepression.add(nullToZero(a.getDepressionRatio()));
						totalAnxiety = totalAnxiety.add(nullToZero(a.getAnxietyRatio()));
						count++;
					}
				}
			}

			BigDecimal happinessIndex = BigDecimal.ZERO;
			BigDecimal depressionIndex = BigDecimal.ZERO;

			if (count > 0) {
				BigDecimal c = BigDecimal.valueOf(count);
				happinessIndex = divide(totalJoy, c).add(divide(totalHope, c))
						.divide(BigDecimal.valueOf(2), 1, RoundingMode.HALF_UP);
				depressionIndex = divide(totalSadness, c).add(divide(totalDepression, c)).add(divide(totalAnxiety, c))
						.divide(BigDecimal.valueOf(3), 1, RoundingMode.HALF_UP);
			}

			result.add(DashboardStatsResponse.MonthlyEmotionTrend.builder()
					.year(year)
					.month(month)
					.monthLabel(month + "월")
					.happinessIndex(happinessIndex)
					.depressionIndex(depressionIndex)
					.diaryCount(diaryCount)
					.build());
		}

		return result;
	}

	/**
	 * 최근 일기 활동 조회
	 */
	private List<DashboardStatsResponse.RecentDiaryActivity> getRecentActivities(List<Integer> patientIds, int limit) {
		if (patientIds.isEmpty()) {
			return new ArrayList<>();
		}

		List<Diary> recentDiaries = diaryRepository.findRecentDiariesByMemberIds(patientIds);

		return recentDiaries.stream()
				.limit(limit)
				.map(diary -> {
					String dominantEmotion = "중립";
					BigDecimal dominantRatio = BigDecimal.ZERO;

					Analysis a = diary.getAnalysis();
					if (a != null) {
						dominantEmotion = findDominantEmotion(a);
						dominantRatio = getMaxEmotionRatio(a);
					}

					return DashboardStatsResponse.RecentDiaryActivity.builder()
							.diaryIdx(diary.getDiaryIdx())
							.memberId(diary.getMember().getId())
							.memberName(diary.getMember().getName())
							.diaryTitle(diary.getDiaryTitle())
							.createdAt(diary.getCreatedAt().toLocalDateTime()
									.format(DateTimeFormatter.ofPattern("MM-dd HH:mm")))
							.dominantEmotion(dominantEmotion)
							.dominantRatio(dominantRatio)
							.build();
				})
				.collect(Collectors.toList());
	}

	/**
	 * 중증 환자 상세 정보 조회
	 */
	private List<DashboardStatsResponse.SeverePatientInfo> getSeverePatientDetails(
			List<Member> severePatients, String currentYearMonth) {

		return severePatients.stream()
				.map(patient -> {
					// 최근 일기 조회
					Optional<Diary> lastDiary = diaryRepository.findTop1ByMember_IdOrderByCreatedAtDesc(patient.getId());

					String lastDiaryDate = "-";
					String lastDiaryTitle = "-";
					if (lastDiary.isPresent()) {
						lastDiaryDate = lastDiary.get().getCreatedAt().toLocalDateTime()
								.format(DateTimeFormatter.ofPattern("MM-dd"));
						lastDiaryTitle = lastDiary.get().getDiaryTitle();
					}

					// 이번 달 일기 수
					Integer diaryCount = diaryRepository.countByMemberAndMonth(patient.getId(), currentYearMonth);

					// 우울 지수 계산
					BigDecimal depressionIndex = BigDecimal.ZERO;
					List<Diary> monthDiaries = diaryRepository.findByMemberAndMonthWithAnalysis(
							patient.getId(), currentYearMonth);

					if (!monthDiaries.isEmpty()) {
						BigDecimal totalDep = BigDecimal.ZERO;
						int count = 0;
						for (Diary d : monthDiaries) {
							if (d.getAnalysis() != null) {
								Analysis a = d.getAnalysis();
								totalDep = totalDep.add(nullToZero(a.getSadnessRatio()))
										.add(nullToZero(a.getDepressionRatio()))
										.add(nullToZero(a.getAnxietyRatio()));
								count++;
							}
						}
						if (count > 0) {
							depressionIndex = totalDep.divide(BigDecimal.valueOf(count * 3), 1, RoundingMode.HALF_UP);
						}
					}

					return DashboardStatsResponse.SeverePatientInfo.builder()
							.memberId(patient.getId())
							.memberName(patient.getName())
							.phone(patient.getPhone())
							.depressionIndex(depressionIndex)
							.lastDiaryDate(lastDiaryDate)
							.lastDiaryTitle(lastDiaryTitle)
							.diaryCountThisMonth(diaryCount != null ? diaryCount : 0)
							.build();
				})
				.collect(Collectors.toList());
	}

	/**
	 * 가장 높은 감정 비율 조회
	 */
	private BigDecimal getMaxEmotionRatio(Analysis a) {
		BigDecimal max = BigDecimal.ZERO;
		BigDecimal[] values = {
				nullToZero(a.getAnxietyRatio()), nullToZero(a.getSadnessRatio()),
				nullToZero(a.getJoyRatio()), nullToZero(a.getAngerRatio()),
				nullToZero(a.getRegretRatio()), nullToZero(a.getHopeRatio()),
				nullToZero(a.getNeutralityRatio()), nullToZero(a.getTirednessRatio()),
				nullToZero(a.getDepressionRatio())
		};
		for (BigDecimal v : values) {
			if (v.compareTo(max) > 0) max = v;
		}
		return max;
	}

	/**
	 * 빈 대시보드 통계 생성
	 */
	private DashboardStatsResponse createEmptyDashboardStats() {
		return DashboardStatsResponse.builder()
				.totalPatients(0)
				.severePatients(0)
				.monthlyDiaryCount(0)
				.avgHappinessIndex(BigDecimal.ZERO)
				.emotionSummary(DashboardStatsResponse.EmotionSummary.builder()
						.anxiety(BigDecimal.ZERO).sadness(BigDecimal.ZERO).joy(BigDecimal.ZERO)
						.anger(BigDecimal.ZERO).regret(BigDecimal.ZERO).hope(BigDecimal.ZERO)
						.neutrality(BigDecimal.ZERO).tiredness(BigDecimal.ZERO).depression(BigDecimal.ZERO)
						.build())
				.weeklyDiaryCounts(new ArrayList<>())
				.monthlyTrends(new ArrayList<>())
				.recentActivities(new ArrayList<>())
				.severePatientDetails(new ArrayList<>())
				.build();
	}
}