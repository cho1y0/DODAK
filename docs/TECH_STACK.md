# Dodak Project 기술 스택

> **Dodak (도닥)** - AI 기반 감정 일기 & 심리 케어 플랫폼

## 목차

1. [Backend (Spring Boot)](#backend-spring-boot)
2. [AI Server (FastAPI)](#ai-server-fastapi)
3. [Frontend](#frontend)
4. [Database](#database)
5. [인프라](#인프라)
6. [아키텍처](#아키텍처)
7. [기능별 기술 매핑](#기능별-기술-매핑)

---

## Backend (Spring Boot)

### 코어 프레임워크

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Spring Boot | 3.5.7 | 메인 웹 애플리케이션 프레임워크 |
| Spring Security | 6.x | 인증/인가 보안 프레임워크 |
| Spring Data JPA | 3.x | ORM 및 데이터 접근 계층 |
| Spring Web | 3.x | REST API 및 MVC |

### 뷰 템플릿

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Thymeleaf | 3.x | 서버사이드 템플릿 엔진 |
| Thymeleaf Extras Spring Security 6 | - | Security 통합 |

### 데이터베이스 연동

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| MySQL Connector/J | 8.x | MySQL JDBC 드라이버 |
| QueryDSL JPA | 5.0.0 | 타입 세이프 쿼리 빌더 |
| QueryDSL Core | 5.0.0 | QueryDSL 핵심 모듈 |
| QueryDSL APT | 5.0.0 | 컴파일 타임 Q클래스 생성 |

### 유틸리티

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Lombok | latest | 보일러플레이트 코드 자동 생성 |
| Jakarta Persistence API | 3.1.0 | JPA 표준 인터페이스 |

### 빌드 도구

| 도구 | 버전 | 설명 |
|------|------|------|
| Maven | 3.x | 의존성 관리 및 빌드 |
| Java | 17 | LTS 버전 |

---

## AI Server (FastAPI)

### 웹 프레임워크

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| FastAPI | latest | 비동기 REST API 서버 |
| Uvicorn | latest | ASGI 서버 |
| Pydantic | latest | 데이터 검증 및 직렬화 |
| nest_asyncio | latest | Jupyter 비동기 호환성 |

### AI/NLP 모델

| 모델/라이브러리 | 설명 |
|----------------|------|
| KoBERT (skt/kobert-base-v1) | 감정 분류 모델 |
| KoGPT2 | 대화 생성 모델 (Simple Chatbot) |
| Regex 기반 문장 분리기 | KSS 대체 경량 분리기 |

### 감정 분석 엔진

```python
# 8가지 감정 분류
EMOTION_NAMES = [
    "joy",        # 기쁨
    "hope",       # 희망
    "neutrality", # 중립
    "anger",      # 분노
    "sadness",    # 슬픔
    "anxiety",    # 불안
    "tiredness",  # 피로
    "regret"      # 후회
]

# 우울증 위험 키워드
DEPRESSION_KEYWORDS = ["죽", "의미 없", "사라지고 싶", "절망", "포기하"]
```

### 웹 크롤링 (YouTube)

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Selenium | latest | 브라우저 자동화 |
| BeautifulSoup4 | latest | HTML 파싱 |
| webdriver-manager | latest | ChromeDriver 자동 관리 |

### CORS 설정

```python
origins = [
    "http://192.168.0.9:8083",
    "http://192.168.0.5:8083",
    "http://localhost:8083",
    "http://127.0.0.1:8083",
]
```

---

## Frontend

### 템플릿 엔진

| 기술 | 설명 |
|------|------|
| Thymeleaf | Spring Boot 통합 뷰 템플릿 |
| HTML5 | 마크업 |
| CSS3 | 스타일링 |
| JavaScript (ES6+) | 동적 인터랙션 |

### 주요 화면

| 화면 | 파일 | 설명 |
|------|------|------|
| 메인 | index.html | 서비스 소개 |
| 로그인 | login.html | 사용자 로그인 |
| 회원가입 | member/addUser.html | 신규 가입 |
| 사용자 메인 | member/mainNew.html | 일기 작성/조회/분석 |
| 의사 메인 | doctor/main.html | 환자 정보 조회 |

---

## Database

### MySQL 8.0

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| tb_member | 회원 정보 | id, user_id, password, name, email, role |
| tb_diary | 일기 데이터 | diary_idx, id(FK), diary_title, diary_content, file1~3 |
| tb_analysis | 감정 분석 결과 | analysis_idx, diary_idx(FK), 8개 감정 비율 |
| tb_hospital | 병원 정보 | hosp_idx, hosp_name, addr1, addr2, tel |
| tb_doctor | 의사 정보 | doc_idx, hosp_idx(FK), member_id(FK), specialty |
| tb_arrange | 상담 예약 | arr_idx, member_id(FK), doc_idx(FK), arr_date, status |

### 분석 결과 저장 구조

```sql
CREATE TABLE tb_analysis (
    analysis_idx INT AUTO_INCREMENT PRIMARY KEY,
    diary_idx INT NOT NULL UNIQUE,
    model_name VARCHAR(50) NOT NULL DEFAULT 'skt/kobert-base-v1',
    anxiety_ratio DECIMAL(4,1) NOT NULL,
    sadness_ratio DECIMAL(4,1) NOT NULL,
    joy_ratio DECIMAL(4,1) NOT NULL,
    anger_ratio DECIMAL(4,1) NOT NULL,
    regret_ratio DECIMAL(4,1) NOT NULL,
    hope_ratio DECIMAL(4,1) NOT NULL,
    neutrality_ratio DECIMAL(4,1) NOT NULL,
    tiredness_ratio DECIMAL(4,1) NOT NULL,
    depression_ratio DECIMAL(4,1) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diary_idx) REFERENCES tb_diary(diary_idx)
);
```

---

## 인프라

### 서버 구성

| 구분 | 호스트 | 포트 | 설명 |
|------|--------|------|------|
| Web Server | 192.168.0.x | 8083 | Spring Boot (Tomcat) |
| AI Server | 192.168.0.20 | 8000 | FastAPI (Uvicorn) |
| Database | 192.168.0.x | 3306 | MySQL 8.0 |

### 네트워크 구성

```
┌─────────────────────────────────────────────────────────────┐
│                    Internal Network                          │
│                     192.168.0.0/24                           │
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │ Web Server  │    │  AI Server  │    │   MySQL     │      │
│  │   :8083     │◀──▶│    :8000    │    │   :3306     │      │
│  │ Spring Boot │    │   FastAPI   │    │             │      │
│  └──────┬──────┘    └─────────────┘    └──────▲──────┘      │
│         │                                      │             │
│         └──────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 아키텍처

### 레이어 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│              Thymeleaf Templates + JavaScript                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Controller Layer                        │
│     MainController, MemberRestController, DiaryRest...       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Service Layer                          │
│  MemberService, DiaryService, AnalysisService, ...          │
│  CustomUserDetailsService (Spring Security)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Repository Layer                         │
│           JPA Repository + QueryDSL Custom Impl              │
│   DiaryRepository, DiaryRepositoryImpl (QueryDSL)            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Entity Layer                           │
│     Member, Diary, Analysis, Hospital, Doctor, Arrange       │
└─────────────────────────────────────────────────────────────┘
```

### AI 분석 흐름

```
[사용자] → [일기 작성] → [Spring Boot]
                              │
                              ▼
                    ┌─────────────────┐
                    │  FastAPI 호출   │
                    │  /diary?s=...   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   문장 분리     │
                    │  (Regex 기반)   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  감정 분석      │
                    │  (키워드 기반)  │
                    │  8감정 + 우울   │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  결과 반환      │
                    │  JSON Response  │
                    └────────┬────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  DB 저장        │
                    │  tb_analysis    │
                    └─────────────────┘
```

---

## 기능별 기술 매핑

| 기능 | Frontend | Backend | AI/External |
|------|----------|---------|-------------|
| 로그인/회원가입 | Thymeleaf | Spring Security | - |
| 일기 작성 | HTML Form | JPA Repository | - |
| 감정 분석 | JavaScript AJAX | REST API 호출 | FastAPI /diary |
| 챗봇 대화 | JavaScript | REST Proxy | FastAPI /chatbot |
| 음악 추천 | 영상 플레이어 | REST Proxy | Selenium YouTube |
| 병원/의사 관리 | 관리 화면 | JPA CRUD | - |
| 예약 관리 | 캘린더 UI | Schedule Service | - |

---

## API 엔드포인트 목록

### Spring Boot REST API

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/api/member/**` | CRUD | 회원 관리 |
| `/api/diary/**` | CRUD | 일기 관리 |
| `/api/analysis/**` | CRUD | 분석 결과 |
| `/api/hospital/**` | CRUD | 병원 관리 |
| `/api/doctor/**` | CRUD | 의사 관리 |
| `/api/arrange/**` | CRUD | 예약 관리 |

### FastAPI AI API

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/` | GET | 서버 상태 확인 |
| `/diary` | GET | 감정 분석 |
| `/chatbot/g` | GET | Simple 챗봇 |
| `/chatbot/b` | GET | Complex 챗봇 |
| `/youtube/search` | POST | 음악 검색 |

---

## 감정-음악 매핑

| 감정 (한글) | 검색 쿼리 |
|-------------|-----------|
| 분노 | 분노 가라앉히는 음악 |
| 불안 | 불안할때 듣는 노래 |
| 슬픔 | 슬플때 듣는 노래 |
| 기쁨 | 기쁠때 듣는 노래 |
| 후회 | 후회할때 듣는노래 |
| 희망 | 희망찬 브금 |
| 중립 | 머릿속이 복잡할때 듣는 노래 |
| 피로 | 지치고 힘들때 듣는 노래 |
| 우울 | 우울함을 달래줄 노래 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2026-02-03 | 최초 작성 | 박제연 |
