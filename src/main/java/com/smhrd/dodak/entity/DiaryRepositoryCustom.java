package com.smhrd.dodak.entity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DiaryRepositoryCustom {
    
    Page<Diary> searchDiaries(
        Integer memberId, 
        String year, 
        String month, 
        String day, 
        String keyword,
        Integer selectMemberId,
        Pageable pageable
    );    
}