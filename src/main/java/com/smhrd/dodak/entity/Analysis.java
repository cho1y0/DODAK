package com.smhrd.dodak.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "tb_analysis")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@ToString
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_idx")
    private Integer analysisIdx; // 분석 식별자 (PK)

    // FK: tb_diary (diary_idx)
    @OneToOne(fetch = FetchType.LAZY) // 일기 1 : 분석 1 (혹은 ManyToOne일 수 있으나 DDL은 OneToOne 관계에 가까움)
    @JoinColumn(name = "diary_idx", nullable = false, unique = true) // 일기당 하나의 분석 결과를 가정
    private Diary diary; 

    @Column(name = "model_name", nullable = false, length = 50)
    private String modelName;

    // NUMERIC(4, 1)에 대응, BigDecimal 사용
    @Column(name = "anxiety_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal anxietyRatio;
    
    @Column(name = "sadness_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal sadnessRatio;
    
    @Column(name = "joy_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal joyRatio;        
    
    @Column(name = "anger_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal angerRatio;
    
    @Column(name = "regret_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal regretRatio;
    
    @Column(name = "hope_ratio", nullable = false, precision = 4, scale = 1)    
    private BigDecimal hopeRatio;
    
    @Column(name = "neutrality_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal neutralityRatio;
    
    @Column(name = "tiredness_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal tirednessRatio;
    
    @Column(name = "depression_ratio", nullable = false, precision = 4, scale = 1)
    private BigDecimal depressionRatio;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt;
    
    // --- 정적 팩토리 메서드 (AI 응답을 엔티티로 변환) ---
    /**
     * Diary와 AnalysisResponse DTO를 받아 Analysis Entity를 생성하는 정적 팩토리 메서드.
     */
    public static Analysis createAnalysis(Diary diary, AnalysisResponse response) {
        return Analysis.builder()
                .diary(diary) // FK 설정
                .modelName((response.getModelName() == null || "".equals(response.getModelName()) ? "skt/kobert-base-v1" : response.getModelName()))                
                .anxietyRatio(response.getAnxiety())
                .sadnessRatio(response.getSadness())
                .joyRatio(response.getJoy())
                .angerRatio(response.getAnger())
                .regretRatio(response.getRegret())
                .hopeRatio(response.getHope())
                .depressionRatio(response.getDepression())
                .tirednessRatio(response.getTiredness())
                .neutralityRatio(response.getNeutrality())
                .build();
    }

    // 분석 결과는 일반적으로 수정되지 않지만, 필요하다면 추가 가능
    public void update(String modelName, BigDecimal anxietyRatio, 
    		BigDecimal sadnessRatio, BigDecimal joyRatio, BigDecimal angerRatio, 
    		BigDecimal regretRatio, BigDecimal hopeRatio, BigDecimal neutralityRatio, 
    		BigDecimal tirednessRatio, BigDecimal depressionRatio) {
    	this.modelName = modelName;
        this.anxietyRatio = anxietyRatio;
        this.sadnessRatio = sadnessRatio;
        this.joyRatio = joyRatio;
        this.angerRatio = angerRatio;
        this.regretRatio = regretRatio;
        
        this.hopeRatio = hopeRatio;
        this.tirednessRatio = tirednessRatio;
        this.depressionRatio = depressionRatio;
        this.neutralityRatio = neutralityRatio;
        
    }
}