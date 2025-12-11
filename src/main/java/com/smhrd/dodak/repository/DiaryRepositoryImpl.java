package com.smhrd.dodak.repository;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.smhrd.dodak.entity.Diary;
import com.smhrd.dodak.entity.DiaryRepositoryCustom;
import com.smhrd.dodak.entity.QAnalysis;
// ⚠️ Q-Class의 경로는 실제 생성된 위치와 일치해야 합니다.
import com.smhrd.dodak.entity.QDiary;
import com.smhrd.dodak.entity.QMember;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class DiaryRepositoryImpl implements DiaryRepositoryCustom {


    private final JPAQueryFactory queryFactory;

    // Q-Class 인스턴스 (필수)
    private final QDiary diary = QDiary.diary; 
    private final QMember member = QMember.member;
 // ... (생성자, queryFactory, QDiary, QMember 유지)
    private final QAnalysis analysis = QAnalysis.analysis; // ⭐️ QAnalysis 추가

    @Override
    public Page<Diary> searchDiaries(Integer memberId, String year, String month, String day, String keyword, Integer selectedMemberId, Pageable pageable) {
        
        // 1. 동적 쿼리 조건 (WHERE 절) 생성
    	BooleanBuilder builder = createWhereCondition(memberId, year, month, day, keyword, selectedMemberId);
        
        // ⭐️ 2. 데이터 조회 쿼리: Member와 Analysis를 FETCH JOIN
        JPAQuery<Diary> query = queryFactory
                .selectFrom(diary)
                // Member와 Analysis를 한 번의 쿼리로 즉시 로딩 (N+1 방지)
                .join(diary.member, member).fetchJoin() // Member fetch join 유지
                .leftJoin(diary.analysis, analysis).fetchJoin() // ⭐️ Analysis fetch join 추가
                .where(builder);
        
        // 3. Pageable의 정렬(Sort) 정보 적용
        applySorting(query, pageable.getSort());

        // 4. Pageable의 페이징(Offset/Limit) 정보 적용 및 실행
        // Querydsl fetch join과 Pageable을 같이 사용할 때, 
        // 하이버네이트는 In-Memory Paging을 수행할 수 있으므로, 
        // List<Diary>를 반환하기 전에 .distinct()를 추가하는 것을 고려해야 합니다.
        List<Diary> diaries = query
                .offset(pageable.getOffset()) 
                .limit(pageable.getPageSize()) 
                .fetch();

        // 5. 총 개수 조회 쿼리 (Count 쿼리에는 Fetch Join을 제거해야 합니다!)
        Long totalCount = queryFactory
                .select(diary.count())
                .from(diary)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(diaries, pageable, totalCount != null ? totalCount : 0L);
    }
    
    // --- Helper Methods ---

    /**
     * WHERE 절의 동적 조건을 생성합니다.
     */
    private BooleanBuilder createWhereCondition(Integer memberId, String year, String month, String day, String keyword, Integer selectedMemberId) {
        BooleanBuilder builder = new BooleanBuilder();

        // 1. 필수 조건: 회원 ID 필터링 (Diary 엔티티의 member 필드 사용)         
        // ⭐️ 선택된 Member ID 검색 조건 추가
        if (selectedMemberId != null) {
            builder.and(diary.member.id.eq(selectedMemberId)); 
        } else {
            // 선택된 ID가 없으면, 로그인한 사용자의 ID로 기본 필터링 (기존 로직 유지)
            builder.and(diary.member.id.eq(memberId)); 
        }
        
        

        // 2. 날짜 검색 조건 (createdAt 필드 사용)
        // 주의: Querydsl의 날짜/시간 함수는 SQL 함수로 변환됩니다.
        if (year != null && !year.isEmpty()) {
            try {
                // year() 함수 사용 (예: 2025)
                builder.and(diary.createdAt.year().eq(Integer.parseInt(year)));
            } catch (NumberFormatException ignored) {}
        }
        if (month != null && !month.isEmpty()) {
            try {
                // month() 함수 사용 (예: 10)
                builder.and(diary.createdAt.month().eq(Integer.parseInt(month)));
            } catch (NumberFormatException ignored) {}
        }
        if (day != null && !day.isEmpty()) {
            try {
                // dayOfMonth() 함수 사용 (예: 20)
                builder.and(diary.createdAt.dayOfMonth().eq(Integer.parseInt(day)));
            } catch (NumberFormatException ignored) {}
        }

        // 3. 키워드 검색 조건 (제목 또는 내용)
        if (keyword != null && !keyword.isEmpty()) {
            builder.and(diary.diaryTitle.containsIgnoreCase(keyword)
                    .or(diary.diaryContent.containsIgnoreCase(keyword)));
        }
        
        return builder;
    }

    /**
     * Pageable의 Sort 정보를 Querydsl의 OrderSpecifier로 변환하여 쿼리에 적용합니다.
     */
    private void applySorting(JPAQuery<?> query, Sort sort) {
        for (Sort.Order order : sort) {
            Order direction = order.isAscending() ? Order.ASC : Order.DESC;
            String property = order.getProperty();

            // 엔티티 필드명과 일치해야 합니다. (createdAt 사용)
            if (property.equals("createdAt")) {
                query.orderBy(new OrderSpecifier(direction, diary.createdAt));
            } 
            // 만약 다른 정렬 기준이 있다면 여기에 추가
            else if (property.equals("diaryTitle")) {
                query.orderBy(new OrderSpecifier(direction, diary.diaryTitle));
            }
        }
    }
    
   
}