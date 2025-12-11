package com.smhrd.dodak.entity;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "tb_member")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id; // 회원 식별자 (PK)

    @Column(name = "user_id", nullable = false, unique = true, length = 50)
    private String userId; // 회원 아이디

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 50)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "zip_code", nullable = false, length = 6)
    private String zipCode;

    @Column(nullable = false, length = 255)
    private String addr1;

    @Column(nullable = false, length = 255)
    private String addr2;

    @Column(name = "agreement_yn", nullable = false, length = 1)
    private String agreementYn;

    @Column(nullable = false, length = 6)
    private String role; // 사용자 권한

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private Timestamp joinedAt;
    
    @Column(name = "profile_image", nullable = true, length = 255)
    private String profileImg;
    
    @Transient
    private Integer hospIdx;
    
    @Transient
    private String hospName;
    
    @Transient
    private String specialty;

    // 회원 정보 수정을 위한 메서드
    public void update(String password, String name, String phone, String zipCode, String addr1, String addr2, String profileImg) {
        this.password = password;
        this.name = name;
        this.phone = phone;
        this.zipCode = zipCode;
        this.addr1 = addr1;
        this.addr2 = addr2;
        this.profileImg = profileImg;
    }
}