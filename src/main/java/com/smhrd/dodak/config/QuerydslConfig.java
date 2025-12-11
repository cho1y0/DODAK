package com.smhrd.dodak.config;

import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuerydslConfig {

    // ⭐️ EntityManager를 주입받습니다.
    @PersistenceContext
    private EntityManager em;

    /**
     * JPAQueryFactory를 Spring Bean으로 등록합니다.
     * 이 Bean은 @RequiredArgsConstructor를 사용하는 RepositoryImpl에 자동 주입됩니다.
     */
    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(em);
    }
}