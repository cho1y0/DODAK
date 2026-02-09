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
| Spring Security | 6.x (Boot 내장) | 세션 기반 인증/인가 보안 프레임워크 |
| Spring Data JPA | 3.x (Boot 내장) | ORM 및 데이터 접근 계층 |
| Spring Web | 3.x (Boot 내장) | REST API 및 MVC 컨트롤러 |
| Spring Boot DevTools | 3.5.7 | 개발 시 자동 재시작 및 LiveReload |

### 뷰 템플릿

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Thymeleaf | 3.x (Boot 내장) | 서버사이드 HTML 템플릿 엔진 |
| Thymeleaf Extras Spring Security 6 | - | Thymeleaf 내 Security 태그 통합 (`sec:authorize` 등) |

### 데이터베이스 연동

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| MySQL Connector/J | 8.x (Boot 관리) | MySQL JDBC 드라이버 |
| QueryDSL JPA | 5.0.0 (Jakarta) | 타입 세이프 동적 쿼리 빌더 |
| QueryDSL Core | 5.0.0 | QueryDSL 핵심 모듈 |
| QueryDSL APT | 5.0.0 (Jakarta) | 컴파일 타임 Q클래스 자동 생성 |
| Jakarta Persistence API | 3.1.0 | JPA 표준 인터페이스 (APT 의존성) |

### 보안

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Spring Security | 6.x | SecurityFilterChain 기반 인증/인가 |
| BCryptPasswordEncoder | (Security 내장) | 단방향 비밀번호 해싱 |
| CustomAuthSuccessHandler | - | 역할별 로그인 후 리다이렉트 (USER/DOCTOR) |
| Spring Security Test | 6.x | 보안 관련 단위 테스트 지원 |

### 이메일

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Spring Boot Starter Mail | 3.5.7 | Gmail SMTP 기반 비밀번호 재설정 메일 발송 |

### 유틸리티

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Lombok | Boot 관리 | 보일러플레이트 코드 자동 생성 (@Data, @RequiredArgsConstructor 등) |
| RestTemplate | (Spring Web 내장) | FastAPI AI 서버 HTTP 통신 클라이언트 |

### 테스트

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| Spring Boot Starter Test | 3.5.7 | 통합 테스트 프레임워크 |
| JUnit Jupiter | 6.0.2 | 단위 테스트 엔진 |
| Spring Security Test | 6.x | 인증/인가 테스트 지원 |

### 빌드 도구

| 도구 | 버전 | 설명 |
|------|------|------|
| Maven Wrapper (mvnw) | 3.x | 의존성 관리 및 빌드 (글로벌 PATH 불필요) |
| Java | 17 (LTS) | 런타임 및 컴파일 대상 |
| apt-maven-plugin | 1.1.3 | QueryDSL Q클래스 코드 생성 플러그인 |
| Eclipse STS | 4.32.0 | IDE (Spring Tool Suite) |

---

## AI Server (FastAPI)

### 웹 프레임워크

| 라이브러리 | 버전 | 설명 |
|-----------|------|------|
| FastAPI | latest | 비동기 REST API 서버 |
| Uvicorn | latest | ASGI 서버 |
| Pydantic | latest | 요청/응답 데이터 검증 및 직렬화 |
| nest_asyncio | latest | Jupyter 환경 비동기 호환성 |

### AI/NLP 모델

| 모델/라이브러리 | 형식 | 용도 |
|----------------|------|------|
| KoBERT (skt/kobert-base-v1) | HuggingFace | 일기 텍스트 9가지 감정 분류 (우울 포함) |
| KoGPT2 | HuggingFace | 대화 생성 모델 (Simple Chatbot) |
| Regex 기반 문장 분리기 | Python 내장 | KSS 대체 경량 한국어 문장 분리 |

### 감정 분석 엔진

```python
# 9가지 감정 분류 (우울 포함)
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
| Selenium | latest | 브라우저 자동화 (YouTube 검색) |
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

| 기술 | 버전 | 설명 |
|------|------|------|
| Thymeleaf | 3.x (Boot 내장) | Spring Boot 통합 SSR 템플릿 |
| HTML5 | - | 시맨틱 마크업 |
| CSS3 | - | 커스텀 스타일링 (Bootstrap-like) |
| JavaScript (ES6+) | - | 동적 인터랙션, Fetch API, AJAX |

### 데이터 시각화

| 기술 | 설명 |
|------|------|
| Chart.js / Canvas API | 감정 분석 차트 (파이차트, 라인차트, 레이더차트) |

### Thymeleaf Fragment 구조

| 프래그먼트 | 파일 | 설명 |
|-----------|------|------|
| head | fragments/head.html | 공통 meta, CSS 링크 |
| background | fragments/background.html | 배경 애니메이션 |
| member-navbar | fragments/member-navbar.html | 환자 전용 네비게이션 |
| doctor-navbar | fragments/doctor-navbar.html | 의사 전용 네비게이션 |
| scripts | fragments/scripts.html | 공통 JavaScript |
| diary-detail-modal | fragments/diary-detail-modal.html | 일기 상세 보기 모달 |
| hospital-modal | fragments/hospital-modal.html | 병원 검색 모달 |

### 주요 화면 (사용자)

| 화면 | 파일 | 설명 |
|------|------|------|
| 메인 | index.html | 서비스 소개 랜딩 페이지 |
| 로그인 | login.html | 사용자 로그인 |
| 회원가입 | member/addUser.html | 신규 가입 (ID/이메일 중복 검사) |
| 사용자 홈 | member/home.html | 감정 분석 요약, 챗봇, 음악 추천 |
| 일기 작성 | member/diary-write.html | 일기 작성 + AI 감정 분석 호출 |
| 일기 목록 | member/diary-list.html | 일기 목록 조회, 검색, 페이징 |
| 마이페이지 | member/mypage.html | 프로필 수정, 프로필 이미지 업로드 |

### 주요 화면 (의사)

| 화면 | 파일 | 설명 |
|------|------|------|
| 의사 홈 | doctor/home.html | 담당 환자 목록 |
| 대시보드 | doctor/dashboard.html | 환자 감정 통계 차트 (주간/월간 추이) |
| 환자 통계 | doctor/patient-stats.html | 개별 환자 감정 분석 상세 |
| 환자 일기 | doctor/patient-diary-list.html | 담당 환자 일기 열람 |
| 마이페이지 | doctor/mypage.html | 의사 프로필 관리 |

---

## Database

### MySQL 8.0 (office_mate)

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| tb_member | 회원 정보 | id (PK), user_id, password, name, email, role (USER/DOCTOR), profile_img |
| tb_diary | 일기 데이터 | diary_idx (PK), id (FK→member), diary_title, diary_content, file1~3, created_at |
| tb_analysis | 감정 분석 결과 | analysis_idx (PK), diary_idx (FK, UNIQUE), model_name, 9가지 감정 비율 (불안, 슬픔, 기쁨, 분노, 후회, 희망, 중립, 피로, 우울) |
| tb_hospital | 병원 정보 | hosp_idx (PK), hosp_name, addr1, addr2, tel |
| tb_doctor | 의사 정보 | doc_idx (PK), hosp_idx (FK→hospital), member_id (FK→member), specialty |
| tb_arrange | 환자-의사 배정 | arr_idx (PK), id (FK→member), doct_idx (FK→doctor), created_at |

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

### 파일 업로드

| 항목 | 내용 |
|------|------|
| 저장 경로 | `C:/dodak` |
| 단일 파일 제한 | 10MB |
| 총 요청 제한 | 20MB |
| 프로필 이미지 | UUID 기반 파일명 |
| 일기 첨부 | file1, file2, file3 (최대 3개) |

---

## 인프라

### 서버 구성

| 구분 | 호스트 | 포트 | 설명 |
|------|--------|------|------|
| Web Server | 192.168.0.x | 8083 | Spring Boot (내장 Tomcat) |
| AI Server | 192.168.0.16 | 8000 | FastAPI (Uvicorn) |
| Database | localhost | 3306 | MySQL 8.0 (office_mate) |

### 빌드/배포

| 항목 | 내용 |
|------|------|
| IDE | Eclipse STS 4.32.0 |
| 빌드 도구 | Maven Wrapper (mvnw/mvnw.cmd) |
| Java | 17.0.12 LTS |
| 실행 | `mvnw.cmd spring-boot:run` (PowerShell 필요) |

### 이메일 (SMTP)

| 항목 | 내용 |
|------|------|
| Provider | Gmail SMTP (smtp.gmail.com:587) |
| 기능 | 비밀번호 재설정 링크 발송 |
| 상태 | `mail.feature.enabled=false` (기본 비활성) |

---

## 아키텍처

### 시스템 구성도

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Client (Browser)                                  │
│                    Thymeleaf SSR + JavaScript                               │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │ HTTP (8083)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Spring Boot Server (Port 8083)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                   SecurityFilterChain                               │    │
│  │  ┌───────────────────┐  ┌───────────────────┐                      │    │
│  │  │ BCrypt Password  │  │ Session-Based     │                      │    │
│  │  │ Encoder          │  │ Authentication    │                      │    │
│  │  └───────────────────┘  └───────────────────┘                      │    │
│  │  역할: permitAll → ROLE_USER → ROLE_DOCTOR → authenticated        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │                                              │
│  ┌───────────────────────────┼───────────────────────────┐                 │
│  ▼                           ▼                           ▼                 │
│  Controller Layer    RestController Layer         Thymeleaf Views          │
│  (MainController)    (MemberRest, DiaryRest,      (member/, doctor/,       │
│                       AnalysisRest, ArrangeRest,   fragments/)             │
│                       DoctorRest, HospitalRest)                            │
│  ┌───────────────────────────────────────────────────────┐                 │
│  │                    Service Layer                       │                 │
│  │  MemberService, DiaryService, AnalysisService,        │                 │
│  │  ArrangeService, DoctorService, HospitalService,      │                 │
│  │  CustomUserDetailsService, PasswordResetService,      │                 │
│  │  EmailService, CustomAuthSuccessHandler               │                 │
│  └───────────────────────────┬───────────────────────────┘                 │
│                              │                                              │
│  ┌───────────────────────────┼───────────────────────────┐                 │
│  │              Repository Layer (JPA + QueryDSL)         │                 │
│  │  DiaryRepository + DiaryRepositoryImpl (QueryDSL)     │                 │
│  │  MemberRepository, AnalysisRepository,                │                 │
│  │  ArrangeRepository, DoctorRepository,                 │                 │
│  │  HospitalRepository                                   │                 │
│  └───────────────────────────┬───────────────────────────┘                 │
│                              │                                              │
│  ┌───────────────────────────┼───────────────────────────┐                 │
│  │                   Entity Layer                         │                 │
│  │  Member, Diary, Analysis, Hospital, Doctor, Arrange   │                 │
│  │  Q클래스: QMember, QDiary, QAnalysis, QHospital,      │                 │
│  │          QDoctor, QArrange                            │                 │
│  └───────────────────────────────────────────────────────┘                 │
└──────────────────────────────┬──────────────────────────────────────────────┘
                               │ JPA/Hibernate
                               ▼
                    ┌───────────────────┐
                    │   MySQL 8.0      │
                    │   office_mate    │
                    │   Port: 3306     │
                    └───────────────────┘
```

### AI 분석 흐름

```
[사용자] → [일기 작성] → [Spring Boot :8083]
                              │
                              ▼
                    ┌─────────────────┐
                    │  RestTemplate   │
                    │  FastAPI 호출   │
                    │  :8000/diary    │
                    └────────┬────────┘
                             │ HTTP GET (?s=일기내용)
                             ▼
                    ┌─────────────────┐
                    │   문장 분리     │
                    │  (Regex 기반)   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  KoBERT 추론    │
                    │  (감정 분류)    │
                    │  8감정 + 우울   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  JSON 응답      │
                    │  감정 비율 반환  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Spring Boot    │
                    │  DB 저장        │
                    │  tb_analysis    │
                    └─────────────────┘
```

### 네트워크 구성

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Internal Network (192.168.0.0/24)                  │
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │  Web Server     │    │  AI Server      │    │   MySQL 8.0     │     │
│  │  :8083          │◀──▶│  :8000          │    │   :3306         │     │
│  │  Spring Boot    │    │  FastAPI         │    │  office_mate    │     │
│  │  (192.168.0.x)  │    │  (192.168.0.16) │    │  (localhost)    │     │
│  └──────┬──────────┘    └─────────────────┘    └──────▲──────────┘     │
│         │                                             │                 │
│         └─────────────────────────────────────────────┘                 │
│                        JDBC (JPA/Hibernate)                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### QueryDSL 동적 쿼리 구조

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    QueryDSL 동적 쿼리 (DiaryRepositoryImpl)             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  JPAQueryFactory (Bean)                                         │    │
│  │  ├─ QuerydslConfig.java → EntityManager 기반 팩토리 등록       │    │
│  │  └─ DiaryRepositoryImpl에 자동 주입                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  searchDiaries() 메서드 (Page<Diary> 반환)                     │    │
│  │  1. BooleanBuilder: 회원ID, 연/월/일, 키워드, 선택환자 조건    │    │
│  │  2. Fetch Join: Member + Analysis (N+1 방지)                   │    │
│  │  3. OrderSpecifier: createdAt, diaryTitle 동적 정렬            │    │
│  │  4. Pageable: offset/limit 페이징 → PageImpl 반환              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  apt-maven-plugin (1.1.3)                                       │    │
│  │  └─ Q클래스 생성: target/generated-sources/annotations/         │    │
│  │     QMember, QDiary, QAnalysis, QHospital, QDoctor, QArrange    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 데이터 흐름

```
사용자 요청 → Browser → Spring Boot (SecurityFilterChain) → 처리 분기 → 응답
                                      │
                                      ├── 뷰 렌더링 (MainController):
                                      │   ├── Thymeleaf SSR (index, login, join)
                                      │   ├── 역할별 리다이렉트 (USER→member/, DOCTOR→doctor/)
                                      │   └── 세션 검증 후 뷰 반환
                                      │
                                      ├── REST API (RestController):
                                      │   ├── 회원 CRUD (MemberRestController)
                                      │   ├── 일기 CRUD + 검색/페이징 (DiaryRestController)
                                      │   ├── 분석 결과 CRUD + 통계 (AnalysisRestController)
                                      │   ├── 병원/의사/배정 CRUD
                                      │   └── 비밀번호 재설정 (PasswordResetController)
                                      │
                                      └── AI 서버 연동 (RestTemplate → FastAPI):
                                          ├── 감정 분석 (GET /diary?s=...)
                                          ├── 챗봇 대화 (GET /chatbot/g, /chatbot/b)
                                          └── 음악 추천 (POST /youtube/search)
```

---

## 기능별 기술 매핑

| 기능 | Frontend | Backend | AI/External |
|------|----------|---------|-------------|
| **로그인/회원가입** | Thymeleaf Form, JavaScript 유효성 검사 | Spring Security (SecurityFilterChain, BCrypt, CustomAuthSuccessHandler) | MySQL (tb_member) |
| **일기 작성** | Thymeleaf Form, 파일 업로드 (MultipartFile) | DiaryRestController, DiaryService, JPA Repository | MySQL (tb_diary) |
| **감정 분석** | JavaScript Fetch/AJAX, Chart.js | RestTemplate → FastAPI 호출, AnalysisService | KoBERT (skt/kobert-base-v1) |
| **챗봇 대화** | JavaScript AJAX | REST Proxy (RestTemplate) | FastAPI /chatbot/g (KoGPT2) |
| **음악 추천** | 영상 임베드 플레이어 | REST Proxy (RestTemplate) | Selenium YouTube 크롤링 |
| **일기 검색/페이징** | Thymeleaf 동적 렌더링, JavaScript | DiaryRepositoryImpl (QueryDSL 동적 쿼리, Fetch Join, BooleanBuilder) | MySQL (tb_diary + tb_analysis) |
| **의사 대시보드** | Chart.js (파이차트, 라인차트), JavaScript | AnalysisRestController (/dashboard, /stats, /monthly) | MySQL 집계 쿼리 |
| **환자 일기 열람** | Thymeleaf (doctor/patient-diary-list) | DiaryRepositoryImpl (selectedMemberId 필터) | MySQL (QueryDSL Join) |
| **병원/의사 관리** | Thymeleaf Form, 검색 모달 (hospital-modal) | HospitalRestController, DoctorRestController, JPA CRUD | MySQL (tb_hospital, tb_doctor) |
| **환자 배정** | Thymeleaf 배정 관리 UI | ArrangeRestController, ArrangeService | MySQL (tb_arrange) |
| **프로필 관리** | Thymeleaf Form, 이미지 업로드 | MemberRestController (UUID 파일명, C:/dodak 저장) | MySQL (tb_member.profile_img) |
| **비밀번호 재설정** | Thymeleaf Form | PasswordResetController, PasswordResetService, EmailService | Gmail SMTP |

---

## API 엔드포인트 목록

### Spring Boot REST API

| 엔드포인트 | 메서드 | 접근 권한 | 설명 |
|------------|--------|-----------|------|
| `/api/members/join` | POST | permitAll | 회원가입 |
| `/api/members/checkId` | GET | permitAll | ID 중복 검사 |
| `/api/members/checkEmail` | GET | permitAll | 이메일 중복 검사 |
| `/api/members/info/{id}` | GET | USER, DOCTOR | 회원 정보 조회 |
| `/api/members/update` | PUT | USER, DOCTOR | 회원 정보 수정 |
| `/api/members/users/**` | GET | DOCTOR | 담당 환자 목록 조회 |
| `/api/members/assignments` | GET | DOCTOR | 환자 배정 정보 |
| `/api/diaries/**` | CRUD | authenticated | 일기 관리 |
| `/api/diaries/detail/{id}` | GET | DOCTOR | 환자 일기 상세 열람 |
| `/api/analyses/**` | CRUD | authenticated | 분석 결과 관리 |
| `/api/analyses/monthly` | GET | DOCTOR | 월간 감정 분석 데이터 |
| `/api/analyses/stats/{id}` | GET | DOCTOR | 환자 월간 통계 |
| `/api/analyses/dashboard/{id}` | GET | DOCTOR | 의사 대시보드 통계 |
| `/api/hospitals/**` | CRUD | permitAll | 병원 관리 |
| `/api/doctors/**` | CRUD | authenticated | 의사 정보 관리 |
| `/api/arranges/**` | CRUD | authenticated | 환자-의사 배정 관리 |
| `/api/password/**` | POST | permitAll | 비밀번호 재설정 |

### FastAPI AI API

| 엔드포인트 | 메서드 | 설명 |
|------------|--------|------|
| `/` | GET | 서버 상태 확인 |
| `/diary` | GET | 감정 분석 (KoBERT) |
| `/chatbot/g` | GET | Simple 챗봇 (KoGPT2) |
| `/chatbot/b` | GET | Complex 챗봇 |
| `/youtube/search` | POST | 감정 기반 음악 검색 (Selenium) |

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

## 관련 문서

| 문서 | 설명 |
|------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 요구사항 정의서 |
| [FUNCTIONAL_SPECIFICATION.md](./FUNCTIONAL_SPECIFICATION.md) | 기능 명세서 |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | API 명세서 |
| [USE_CASES.md](./USE_CASES.md) | 유스케이스 명세서 |
| [SCREEN_DESIGN.md](./SCREEN_DESIGN.md) | 화면 설계서 |
| [TEST_CASES.md](./TEST_CASES.md) | 테스트 케이스 |
| [INTEGRATION_TEST_CASES.md](./INTEGRATION_TEST_CASES.md) | 통합 테스트 |
| [PERFORMANCE_TEST_REPORT.md](./PERFORMANCE_TEST_REPORT.md) | 성능 테스트 보고서 |
| [FINAL_REPORT.md](./FINAL_REPORT.md) | 최종 결과 보고서 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| 1.0 | 2026-02-03 | 최초 작성 | 최대영 |
| 1.1 | 2026-02-09 | QueryDSL 동적 쿼리 구조, 보안 설정(SecurityFilterChain, 역할별 접근 제어), 의사 기능 기술 매핑 추가, 실제 구현 기반 최신화 | 박제연 |
