package com.smhrd.dodak.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 의사 대시보드 통계 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    // 요약 카드 데이터
    private Integer totalPatients;      // 총 배정 환자 수
    private Integer severePatients;     // 중증 환자 수
    private Integer monthlyDiaryCount;  // 이번 달 일기 수
    private BigDecimal avgHappinessIndex; // 평균 행복지수

    // 전체 환자 감정 평균
    private EmotionSummary emotionSummary;

    // 최근 7일 일기 작성 추이
    private List<DailyDiaryCount> weeklyDiaryCounts;

    // 월별 감정 추이 (최근 6개월)
    private List<MonthlyEmotionTrend> monthlyTrends;

    // 최근 일기 활동 (최근 10개)
    private List<RecentDiaryActivity> recentActivities;

    // 중증 환자 상세 정보
    private List<SeverePatientInfo> severePatientDetails;

    /**
     * 전체 감정 요약
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmotionSummary {
        private BigDecimal anxiety;
        private BigDecimal sadness;
        private BigDecimal joy;
        private BigDecimal anger;
        private BigDecimal regret;
        private BigDecimal hope;
        private BigDecimal neutrality;
        private BigDecimal tiredness;
        private BigDecimal depression;
    }

    /**
     * 일별 일기 작성 수
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyDiaryCount {
        private String date;      // YYYY-MM-DD
        private String dayLabel;  // "오늘", "어제", "2일 전" 등
        private Integer count;
    }

    /**
     * 월별 감정 추이
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MonthlyEmotionTrend {
        private Integer year;
        private Integer month;
        private String monthLabel;  // "1월", "2월" 등
        private BigDecimal happinessIndex;
        private BigDecimal depressionIndex;
        private Integer diaryCount;
    }

    /**
     * 최근 일기 활동
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentDiaryActivity {
        private Integer diaryIdx;
        private Integer memberId;
        private String memberName;
        private String diaryTitle;
        private String createdAt;     // 작성 시간
        private String dominantEmotion;
        private BigDecimal dominantRatio;
    }

    /**
     * 중증 환자 상세 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeverePatientInfo {
        private Integer memberId;
        private String memberName;
        private String phone;
        private BigDecimal depressionIndex;
        private String lastDiaryDate;
        private String lastDiaryTitle;
        private Integer diaryCountThisMonth;
    }
}
