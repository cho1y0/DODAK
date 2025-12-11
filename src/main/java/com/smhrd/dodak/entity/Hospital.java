package com.smhrd.dodak.entity;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_hospital")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hosp_idx")
    private Integer hospIdx; // 병원 식별자 (PK)

    @Column(name = "hosp_name", nullable = false, length = 50)
    private String hospName;

    @Column(name = "zip_code", nullable = false, length = 6)
    private String zipCode;

    @Column(name = "addr1", nullable = false, length = 255)
    private String addr1;

    @Column(name = "addr2", nullable = false, length = 255)
    private String addr2;

    @Column(name = "tel", nullable = false, length = 20)
    private String tel;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt;

    public void update(String hospName, String zipCode, String addr1, String addr2, String tel) {
        this.hospName = hospName;
        this.zipCode = zipCode;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.tel = tel;
    }
}