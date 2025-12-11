package com.smhrd.dodak.entity;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class AnalysisResponse {
    private String modelName;    
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
