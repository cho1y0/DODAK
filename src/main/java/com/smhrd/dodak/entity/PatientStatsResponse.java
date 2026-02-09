package com.smhrd.dodak.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 환자 월간 통계 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientStatsResponse {

    // 환자 정보
    private Integer memberId;
    private String memberName;
    private Integer year;
    private Integer month;

    // 해당 월 일기 작성 수
    private Integer diaryCount;

    // 평균 감정 비율 (파이 차트용)
    private EmotionAverages emotionAverages;

    // 일별 감정 추이 (라인 차트용)
    private List<DailyEmotion> dailyEmotions;

    // 가장 부정적인 날 TOP 3
    private List<NegativeDayInfo> topNegativeDays;

    // 종합 지표
    private OverallIndicators indicators;

    /**
     * 평균 감정 비율
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmotionAverages {
        private BigDecimal anxiety;    // 불안
        private BigDecimal sadness;    // 슬픔
        private BigDecimal joy;        // 기쁨
        private BigDecimal anger;      // 분노
        private BigDecimal regret;     // 후회
        private BigDecimal hope;       // 희망
        private BigDecimal neutrality; // 중립
        private BigDecimal tiredness;  // 피로
        private BigDecimal depression; // 우울
    }

    /**
     * 일별 감정 데이터 (라인 차트용)
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyEmotion {
        private Integer day;           // 일 (1~31)
        private String date;           // 날짜 문자열 (YYYY-MM-DD)
        private BigDecimal happiness;  // 행복 지수 (기쁨 + 희망)
        private BigDecimal sadnessIndex; // 우울 지수 (슬픔 + 우울 + 불안)
        private String dominantEmotion; // 지배적 감정
    }

    /**
     * 부정적인 날 정보
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NegativeDayInfo {
        private Integer diaryIdx;
        private String date;
        private String title;
        private BigDecimal negativeScore; // 부정 점수 (슬픔+우울+불안+분노)
        private String dominantNegativeEmotion; // 가장 높은 부정 감정
        private BigDecimal dominantNegativeRatio; // 해당 감정 비율
    }

    /**
     * 종합 지표
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OverallIndicators {
        private BigDecimal happinessIndex;    // 종합 행복지수 (0~100)
        private BigDecimal depressionIndex;   // 종합 우울지수 (0~100)
        private Integer happinessLevel;       // 행복지수 단계 (1~5)
        private Integer depressionLevel;      // 우울지수 단계 (1~5)
        private String happinessStatus;       // 상태 텍스트 (예: "보통", "좋음")
        private String depressionStatus;      // 상태 텍스트 (예: "주의", "양호")
        private String recommendation;        // 추천/권고 메시지
    }
}
