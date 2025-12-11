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
import jakarta.persistence.Transient;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "tb_diary")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@ToString
public class Diary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "diary_idx")
    private Integer diaryIdx; // 일기 식별자 (PK)

    // FK: tb_member (id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", nullable = false)
    private Member member; 

    @Column(name = "diary_title", nullable = false, length = 255)
    private String diaryTitle;

    @Column(name = "diary_content", nullable = false, columnDefinition = "TEXT")
    private String diaryContent;

    @Column(length = 255) private String file1;
    @Column(length = 255) private String file2;
    @Column(length = 255) private String file3;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Timestamp createdAt;
    
    @Transient
    private Integer memberId;
    
    // ⭐️ Analysis 엔티티와의 OneToOne 관계 추가
    // mappedBy = "diary" : Analysis 엔티티의 diary 필드에 의해 매핑됨을 나타냄 (주인이 아님)
    // FetchType.LAZY : 기본적으로 지연 로딩
    // cascade = CascadeType.ALL : 일기 삭제 시 분석 결과도 삭제 (선택적)
    @OneToOne(mappedBy = "diary", fetch = FetchType.LAZY)
    private Analysis analysis;

    public void update(String diaryTitle, String diaryContent, String file1, String file2, String file3) {
        this.diaryTitle = diaryTitle;
        this.diaryContent = diaryContent;
        this.file1 = file1;
        this.file2 = file2;
        this.file3 = file3;
    }
}