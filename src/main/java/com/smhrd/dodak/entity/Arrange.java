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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_arrange")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Arrange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "arrange_idx")
    private Integer arrangeIdx; // 배치 식별자 (PK)

    // FK: tb_member (id) - 환자 아이디
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", nullable = false)
    private Member patient; // 담당 환자

    // FK: tb_doctor (doct_idx)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doct_idx", nullable = false)
    private Doctor doctor; // 담당 의사

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt; // 담당 시작일
}