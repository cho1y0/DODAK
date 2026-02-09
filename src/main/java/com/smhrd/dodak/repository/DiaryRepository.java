package com.smhrd.dodak.repository;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smhrd.dodak.entity.Diary;
import com.smhrd.dodak.entity.DiaryRepositoryCustom;
import com.smhrd.dodak.entity.Member;

@Repository
public interface DiaryRepository extends JpaRepository<Diary, Integer>, DiaryRepositoryCustom {

    // 특정 회원의 일기 목록을 조회합니다. (FK: member.id)
    List<Diary> findByMember_Id(Integer memberId);
    Optional<Diary> findTop1ByMemberAndCreatedAtBetweenOrderByCreatedAtDesc(Member member, Timestamp startOfDay, Timestamp endOfDay);
    
    /**
     * 특정 환자가 특정 연월에 작성한 모든 일기를 Analysis와 함께 조회합니다.
     * createdAt 기준으로 오름차순(일자 순) 정렬합니다.
     * * @param memberId 조회할 환자의 PK (Member.id)
     * @param yearMonth YYYY-MM 형식의 문자열 (예: "2025-05")
     * @return 해당 월의 Diary 엔티티 리스트
     */
    @Query("SELECT d FROM Diary d JOIN FETCH d.analysis a " +
           "WHERE d.member.id = :memberId AND FUNCTION('DATE_FORMAT', d.createdAt, '%Y-%m') = :yearMonth " +
           "ORDER BY d.createdAt ASC")
    List<Diary> findByMemberAndMonthWithAnalysis(@Param("memberId") Integer memberId, 
                                                 @Param("yearMonth") String yearMonth);
    
    /**
     * 일기 식별자로 일기, 분석(Analysis), 작성자(Member) 정보를 한 번에 조회합니다.
     * Fetch Join을 사용하여 DTO 변환 시 지연 로딩 문제를 방지합니다.
     * @param diaryIdx 일기 식별자 (PK)
     * @return Diary 엔티티 (Analysis, Member 포함)
     */
    @Query("SELECT d FROM Diary d JOIN FETCH d.analysis a JOIN FETCH d.member m WHERE d.diaryIdx = :diaryIdx")
    Optional<Diary> findByIdWithAnalysisAndMember(@Param("diaryIdx") Integer diaryIdx);

    /**
     * 여러 환자의 최근 일기를 Analysis와 함께 조회합니다.
     * @param memberIds 환자 ID 리스트
     * @param limit 최대 조회 개수
     * @return 최근 일기 리스트 (작성일 내림차순)
     */
    @Query("SELECT d FROM Diary d LEFT JOIN FETCH d.analysis a JOIN FETCH d.member m " +
           "WHERE d.member.id IN :memberIds ORDER BY d.createdAt DESC")
    List<Diary> findRecentDiariesByMemberIds(@Param("memberIds") List<Integer> memberIds);

    /**
     * 특정 날짜 범위의 일기를 조회합니다.
     * @param memberIds 환자 ID 리스트
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 일기 리스트
     */
    @Query("SELECT d FROM Diary d WHERE d.member.id IN :memberIds " +
           "AND d.createdAt >= :startDate AND d.createdAt < :endDate")
    List<Diary> findByMemberIdsAndDateRange(@Param("memberIds") List<Integer> memberIds,
                                            @Param("startDate") Timestamp startDate,
                                            @Param("endDate") Timestamp endDate);

    /**
     * 특정 회원의 최근 일기 1개 조회
     */
    Optional<Diary> findTop1ByMember_IdOrderByCreatedAtDesc(Integer memberId);

    /**
     * 특정 회원의 특정 월 일기 수 조회
     */
    @Query("SELECT COUNT(d) FROM Diary d WHERE d.member.id = :memberId " +
           "AND FUNCTION('DATE_FORMAT', d.createdAt, '%Y-%m') = :yearMonth")
    Integer countByMemberAndMonth(@Param("memberId") Integer memberId, @Param("yearMonth") String yearMonth);
}