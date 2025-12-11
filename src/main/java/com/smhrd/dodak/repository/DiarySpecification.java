package com.smhrd.dodak.repository;

import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;

import com.smhrd.dodak.entity.Diary;

import jakarta.persistence.criteria.Expression;

public class DiarySpecification {
	// 1. 필수 조건: 회원 ID 필터링 Specification
	public static Specification<Diary> byMemberId(Integer memberId) {
		return (root, query, criteriaBuilder) -> {
			// Diary 엔티티의 'member' 필드(엔티티 관계)를 사용하여 member.id와 비교
			return criteriaBuilder.equal(root.get("member").get("id"), memberId);
		};
	}

	// 2. 키워드 검색 (제목 또는 내용) Specification
	public static Specification<Diary> containsKeyword(String keyword) {
		return (root, query, criteriaBuilder) -> {
			if (keyword == null || keyword.isEmpty()) {
				return null; // 조건 없음
			}
			String likeKeyword = "%" + keyword.toLowerCase() + "%";

			// OR 조건: diaryTitle LIKE %keyword% OR diaryContent LIKE %keyword%
			return criteriaBuilder.or(criteriaBuilder.like(criteriaBuilder.lower(root.get("diaryTitle")), likeKeyword),
					criteriaBuilder.like(criteriaBuilder.lower(root.get("diaryContent")), likeKeyword));
		};
	}

	// 3. 날짜 검색 (년, 월, 일) Specification
	public static Specification<Diary> byDate(String year, String month, String day) {
		return (root, query, criteriaBuilder) -> {
			// 모든 날짜 필터가 비어 있으면 조건 없음
			if ((year == null || year.isEmpty()) && (month == null || month.isEmpty())
					&& (day == null || day.isEmpty())) {
				return null;
			}

			// diaryDate 필드에서 년, 월, 일을 추출하여 비교
			Expression<Integer> dateYear = criteriaBuilder.function("YEAR", Integer.class,
					root.get("createdAt"));
			Expression<Integer> dateMonth = criteriaBuilder.function("MONTH", Integer.class,
					root.get("createdAt"));
			Expression<Integer> dateDay = criteriaBuilder.function("DAY", Integer.class,
					root.get("createdAt"));

			jakarta.persistence.criteria.Predicate finalPredicate = criteriaBuilder.conjunction(); // AND 조건 시작

			// 년도 필터
			Optional.ofNullable(year).filter(s -> !s.isEmpty()).ifPresent(y -> {
				try {
					finalPredicate.getExpressions().add(criteriaBuilder.equal(dateYear, Integer.parseInt(y)));
				} catch (NumberFormatException ignored) {
				}
			});

			// 월 필터
			Optional.ofNullable(month).filter(s -> !s.isEmpty()).ifPresent(m -> {
				try {
					finalPredicate.getExpressions().add(criteriaBuilder.equal(dateMonth, Integer.parseInt(m)));
				} catch (NumberFormatException ignored) {
				}
			});

			// 일 필터
			Optional.ofNullable(day).filter(s -> !s.isEmpty()).ifPresent(d -> {
				try {
					finalPredicate.getExpressions().add(criteriaBuilder.equal(dateDay, Integer.parseInt(d)));
				} catch (NumberFormatException ignored) {
				}
			});

			return finalPredicate.getExpressions().isEmpty() ? null : finalPredicate;
		};
	}
}
