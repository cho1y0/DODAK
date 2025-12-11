package com.smhrd.dodak.entity;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_doctor")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "doct_idx")
    private Integer doctIdx; // 의사 식별자 (PK)

    // FK: tb_hospital (hosp_idx)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hosp_idx", nullable = false)
    private Hospital hospital; 

    // FK: tb_member (id) - 의사 정보도 회원 테이블에 저장되어 있다고 가정
    @OneToOne(fetch = FetchType.LAZY) // 의사는 하나의 회원 정보에 대응
    @JoinColumn(name = "id", nullable = false)
    private Member member; 

    @Column(nullable = false, length = 50)
    private String specialty; // 전문 분야

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt;

    public void update(String specialty) {
        this.specialty = specialty;
    }
}