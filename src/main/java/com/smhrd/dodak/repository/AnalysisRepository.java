package com.smhrd.dodak.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smhrd.dodak.entity.Analysis;

@Repository
public interface AnalysisRepository extends JpaRepository<Analysis, Integer> {

    // 특정 일기(Diary) ID에 대한 분석 결과를 조회합니다. (FK: Diary 엔티티의 diaryIdx)
    // tb_analysis의 DDL 상, diary_idx는 하나의 분석 결과만 가지는 OneToOne 관계에 가까우므로 Optional을 반환합니다.
    Optional<Analysis> findByDiary_DiaryIdx(Integer diaryIdx); 
    
    // 특정 회원의 모든 일기에 대한 분석 결과를 조회합니다. (조인 쿼리 필요)
    // List<Analysis> findByDiary_Member_Id(Integer memberId); 
    // ^ Spring Data JPA에서 관계를 따라 쿼리를 생성할 수 있습니다.
    List<Analysis> findByDiary_Member_Id(Integer memberId);
}