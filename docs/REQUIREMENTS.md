# Dodak 시스템 요구사항 정의서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Dodak (AI 기반 감정 일기 & 심리 케어 플랫폼) |
| 문서 버전 | 1.2 |
| 작성일 | 2026-02-09 |
| 작성자 | 최대영 (PM / 기획·프론트엔드) |

---

## 1. 프로젝트 개요

### 1.1 프로젝트 목적
Dodak(도닥)은 사용자의 일상 감정을 기록하고 AI 기반으로 분석하여 심리적 건강을 지원하는 플랫폼입니다.
일기 작성을 통해 9가지 감정을 분석하고, AI 챗봇을 통한 심리 상담과
감정 맞춤형 음악 추천 서비스를 제공합니다. 의사(DOCTOR) 역할의 전문가는 담당 환자의
감정 추이·일기·심각도를 대시보드로 모니터링하고 환자를 배정·관리할 수 있습니다.

### 1.2 프로젝트 범위
- AI 기반 감정 분석 서비스 (9가지 감정: 불안, 슬픔, 기쁨, 분노, 후회, 희망, 중립, 피로, 우울)
- 일기 작성 및 관리 시스템
- AI 챗봇 심리 상담 서비스 (KoGPT2 Simple + KoBERT Complex)
- 감정 맞춤형 YouTube 음악 추천
- 의사 대시보드 (감정 요약, 일일 일기 수, 월별 추이, 최근 활동, 심각 환자)
- 의사-환자 배정(Arrange) 관리
- 병원/의사 정보 관리 시스템
- 사용자 관리 시스템 (환자·의사 역할 구분)

### 1.3 용어 정의

| 용어 | 설명 |
|------|------|
| USER | 일반 사용자 (환자) — 일기 작성, 감정 분석, 챗봇 이용 |
| DOCTOR | 의사 권한 — 담당 환자 정보 조회, 대시보드, 배정 관리 |
| KoBERT | 한국어 BERT 모델 (skt/kobert-base-v1) — 감정 분류 |
| KoGPT2 | 한국어 GPT-2 모델 — 간단 대화 생성 |
| 9감정 | 불안(anxiety), 슬픔(sadness), 기쁨(joy), 분노(anger), 후회(regret), 희망(hope), 중립(neutrality), 피로(tiredness), 우울(depression) |
| Arrange | 의사-환자 배정 (담당 관계 설정, 예약이 아님) |
| patientStatus | 환자 심각도 (1=경증, 2=중증) |

### 1.4 개발 팀 구성

| 이름 | 역할 |
|------|------|
| 최대영 | PM / 기획·프론트엔드 |
| 박제연 | 기획·백엔드 |
| 주현준 | 프론트엔드 |
| 지태민 | 데이터베이스·테스트 |
| 서유나 | 문서작성 |
| 조민솔 | 문서작성 |

---

## 2. 시스템 구성

### 2.1 시스템 아키텍처

```
Client (Browser) - Thymeleaf SSR + JavaScript
        |
        v HTTP
Spring Boot Web Server (:8083)
  - Controller Layer (REST + View)
    MemberRestController, DiaryRestController, AnalysisRestController,
    ArrangeRestController, HospitalRestController, DoctorRestController,
    View Controllers
  - Service Layer
    MemberService, DiaryService, AnalysisService, ArrangeService,
    HospitalService, DoctorService
  - Repository Layer (Spring Data JPA + QueryDSL 5.0.0)
  - Spring Security (BCrypt, Form Login, Session)
        |               |               |
        v               v               v
  MySQL 8.0        FastAPI AI        YouTube
   :3306         192.168.0.16:8000  (Selenium)
  office_mate    /diary (KoBERT 9감정)
  tb_member      /chatbot/g (KoGPT2 Simple)
  tb_diary       /chatbot/b (KoBERT Complex)
  tb_analysis    /youtube/search (음악 추천)
  tb_hospital
  tb_doctor
  tb_arrange
```

### 2.2 포트 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| **Spring Boot** | 8083 | Dodak 메인 웹 서버 (Tomcat) |
| **MySQL** | 3306 | 관계형 데이터베이스 (office_mate) |
| **FastAPI AI** | 8000 | AI 감정 분석·챗봇·음악 추천 서버 (192.168.0.16) |

### 2.3 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | Spring Boot 3.5.7, Java 17, Maven |
| Frontend | Thymeleaf SSR, JavaScript, CSS |
| Database | MySQL 8.0, Spring Data JPA, QueryDSL 5.0.0 |
| AI/ML | KoBERT (skt/kobert-base-v1) 감정 분석, KoGPT2 대화 생성, FastAPI |
| Security | Spring Security, BCrypt, Form Login, Session |
| File | 파일 업로드 (C:/dodak) |

---

## 3. 기능 요구사항

### 3.1 사용자 관리 (UR: User Requirement)

#### UR-001: 회원가입
| 항목 | 내용 |
|------|------|
| 요구사항 ID | UR-001 |
| 요구사항명 | 회원가입 기능 |
| 우선순위 | High |
| 설명 | 신규 사용자가 시스템에 가입할 수 있어야 한다 |
| 상세 요구사항 | - 아이디 (userId, 필수, 중복 불가)<br>- 비밀번호 (필수, BCrypt 암호화)<br>- 이름 (필수)<br>- 이메일 (필수)<br>- 연락처 (phone)<br>- 우편번호 (zipCode)<br>- 주소1 (addr1), 주소2 (addr2)<br>- 약관 동의 여부 (agreementYn)<br>- 역할 (role: USER 또는 DOCTOR) |
| 관련 유스케이스 | UC-AUTH-001 |
| 관련 화면 | SCR-002 |
| 관련 테스트케이스 | TC-UR-001 ~ TC-UR-010 |

#### UR-002: 로그인
| 항목 | 내용 |
|------|------|
| 요구사항 ID | UR-002 |
| 요구사항명 | 로그인 기능 |
| 우선순위 | High |
| 설명 | 등록된 사용자가 시스템에 로그인할 수 있어야 한다 |
| 상세 요구사항 | - Spring Security Form Login 기반 인증<br>- userId + password로 인증<br>- 로그인 성공 시 역할에 따른 페이지 이동 (USER→캘린더, DOCTOR→대시보드)<br>- 세션 기반 인증 유지 |
| 관련 유스케이스 | UC-AUTH-002 |
| 관련 화면 | SCR-001 |
| 관련 테스트케이스 | TC-UR-011 ~ TC-UR-018 |

#### UR-003: 로그아웃
| 항목 | 내용 |
|------|------|
| 요구사항 ID | UR-003 |
| 요구사항명 | 로그아웃 기능 |
| 우선순위 | High |
| 설명 | 로그인된 사용자가 시스템에서 로그아웃할 수 있어야 한다 |
| 상세 요구사항 | - 세션 무효화<br>- 로그인 페이지로 리다이렉트 |
| 관련 유스케이스 | UC-AUTH-003 |
| 관련 화면 | 공통 (네비게이션) |
| 관련 테스트케이스 | TC-UR-019 ~ TC-UR-020 |

#### UR-004: 개인정보 관리
| 항목 | 내용 |
|------|------|
| 요구사항 ID | UR-004 |
| 요구사항명 | 개인정보 조회 및 수정 |
| 우선순위 | Medium |
| 설명 | 사용자가 자신의 개인정보를 조회하고 수정할 수 있어야 한다 |
| 상세 요구사항 | - 프로필 정보 조회 (이름, 아이디, 이메일, 연락처, 주소, 가입일, 역할)<br>- 비밀번호 변경<br>- 연락처, 주소 수정<br>- 프로필 이미지 업로드/변경 (profileImg, 저장 경로: C:/dodak) |
| 관련 유스케이스 | UC-USER-001 |
| 관련 화면 | SCR-004 |
| 관련 테스트케이스 | TC-UR-021 ~ TC-UR-030 |

#### UR-005: 사용자 목록 조회 (의사용)
| 항목 | 내용 |
|------|------|
| 요구사항 ID | UR-005 |
| 요구사항명 | USER 역할 사용자 목록 조회 |
| 우선순위 | Medium |
| 설명 | 의사(DOCTOR)가 환자(USER) 목록을 조회할 수 있어야 한다 |
| 상세 요구사항 | - DOCTOR 권한 전용 API<br>- USER 역할 회원 목록 조회<br>- 환자 상태(patientStatus) 표시 (1=경증, 2=중증) |
| 관련 유스케이스 | UC-USER-002 |
| 관련 화면 | SCR-011 |
| 관련 테스트케이스 | TC-UR-031 ~ TC-UR-035 |

---

### 3.2 일기 관리 (DR: Diary Requirement)

#### DR-001: 일기 작성
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DR-001 |
| 요구사항명 | 일기 작성 기능 |
| 우선순위 | High |
| 설명 | 사용자가 감정 일기를 작성할 수 있어야 한다 |
| 상세 요구사항 | - 일기 제목 입력 (diaryTitle)<br>- 일기 내용 입력 (diaryContent)<br>- 첨부파일 최대 3개 (file1, file2, file3, 저장 경로: C:/dodak)<br>- 작성자 자동 연결 (로그인 사용자 id FK)<br>- 작성일 자동 기록 (createdAt) |
| 관련 유스케이스 | UC-DIARY-001 |
| 관련 화면 | SCR-005 |
| 관련 테스트케이스 | TC-DR-001 ~ TC-DR-008 |

#### DR-002: 일기 목록 조회
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DR-002 |
| 요구사항명 | 일기 목록 조회 |
| 우선순위 | High |
| 설명 | 사용자가 작성한 일기 목록을 조회할 수 있어야 한다 |
| 상세 요구사항 | - 로그인 사용자의 일기 목록 조회<br>- 캘린더 기반 날짜별 일기 표시<br>- 일기 제목, 작성일 표시 |
| 관련 유스케이스 | UC-DIARY-002 |
| 관련 화면 | SCR-003, SCR-006 |
| 관련 테스트케이스 | TC-DR-009 ~ TC-DR-013 |

#### DR-003: 일기 상세 조회
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DR-003 |
| 요구사항명 | 일기 상세 조회 |
| 우선순위 | High |
| 설명 | 일기 상세 내용과 감정 분석 결과를 함께 확인할 수 있어야 한다 |
| 상세 요구사항 | - 일기 제목, 내용, 첨부파일 표시<br>- 연결된 감정 분석 결과 표시 (9가지 감정 비율)<br>- 감정 차트 시각화 |
| 관련 유스케이스 | UC-DIARY-003 |
| 관련 화면 | SCR-007 |
| 관련 테스트케이스 | TC-DR-014 ~ TC-DR-018 |

#### DR-004: 일기 수정
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DR-004 |
| 요구사항명 | 일기 수정 기능 |
| 우선순위 | Medium |
| 설명 | 작성된 일기를 수정할 수 있어야 한다 |
| 상세 요구사항 | - 제목, 내용 수정<br>- 첨부파일 변경<br>- 수정 시 기존 감정 분석 결과 재분석 가능 |
| 관련 유스케이스 | UC-DIARY-004 |
| 관련 화면 | SCR-007 |
| 관련 테스트케이스 | TC-DR-019 ~ TC-DR-023 |

#### DR-005: 일기 삭제
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DR-005 |
| 요구사항명 | 일기 삭제 기능 |
| 우선순위 | Medium |
| 설명 | 작성된 일기와 관련 분석 결과를 삭제할 수 있어야 한다 |
| 상세 요구사항 | - 일기 삭제 시 연결된 분석(Analysis) 함께 삭제<br>- 삭제 확인 절차 |
| 관련 유스케이스 | UC-DIARY-005 |
| 관련 화면 | SCR-007 |
| 관련 테스트케이스 | TC-DR-024 ~ TC-DR-026 |

---

### 3.3 감정 분석 (AR: Analysis Requirement)

#### AR-001: 9가지 감정 분석
| 항목 | 내용 |
|------|------|
| 요구사항 ID | AR-001 |
| 요구사항명 | AI 기반 9가지 감정 분석 |
| 우선순위 | High |
| 설명 | 일기 내용을 AI 모델(KoBERT)로 분석하여 9가지 감정 비율을 추출해야 한다 |
| 상세 요구사항 | - FastAPI 서버(192.168.0.16:8000)의 /diary 엔드포인트 호출<br>- KoBERT(skt/kobert-base-v1) 모델 사용<br>- 9가지 감정: 불안(anxiety), 슬픔(sadness), 기쁨(joy), 분노(anger), 후회(regret), 희망(hope), 중립(neutrality), 피로(tiredness), 우울(depression)<br>- 각 감정 비율은 DECIMAL(4,1) — 0.0~100.0%<br>- 분석 모델명(modelName) 기록 |
| 관련 유스케이스 | UC-ANALYSIS-001 |
| 관련 화면 | SCR-007 |
| 관련 테스트케이스 | TC-AR-001 ~ TC-AR-008 |

#### AR-002: 분석 결과 저장
| 항목 | 내용 |
|------|------|
| 요구사항 ID | AR-002 |
| 요구사항명 | 분석 결과 DB 저장 |
| 우선순위 | High |
| 설명 | 감정 분석 결과를 데이터베이스에 저장해야 한다 |
| 상세 요구사항 | - tb_analysis 테이블에 저장<br>- 일기(diaryIdx)와 1:1 관계 (Unique FK)<br>- 9가지 감정 비율 + 모델명 + 생성일 저장 |
| 관련 유스케이스 | UC-ANALYSIS-001 |
| 관련 화면 | SCR-007 |
| 관련 테스트케이스 | TC-AR-009 ~ TC-AR-012 |

#### AR-003: 월별 감정 통계 조회
| 항목 | 내용 |
|------|------|
| 요구사항 ID | AR-003 |
| 요구사항명 | 월별 감정 통계 |
| 우선순위 | Medium |
| 설명 | 기간별 감정 변화 추이를 집계하여 제공해야 한다 |
| 상세 요구사항 | - 특정 회원의 월별 감정 평균 비율 조회<br>- DOCTOR 권한으로 담당 환자의 월별 통계 조회 가능<br>- QueryDSL 동적 쿼리 사용 |
| 관련 유스케이스 | UC-ANALYSIS-002 |
| 관련 화면 | SCR-008, SCR-012 |
| 관련 테스트케이스 | TC-AR-013 ~ TC-AR-018 |

#### AR-004: 감정 차트 시각화
| 항목 | 내용 |
|------|------|
| 요구사항 ID | AR-004 |
| 요구사항명 | 감정 분석 결과 시각화 |
| 우선순위 | Medium |
| 설명 | 분석된 감정 비율을 차트로 시각화해야 한다 |
| 상세 요구사항 | - 일기별 9감정 비율 차트 (레이더/바 차트)<br>- 기간별 감정 추이 그래프<br>- 캘린더에 감정 색상 표시 |
| 관련 유스케이스 | UC-ANALYSIS-003 |
| 관련 화면 | SCR-003, SCR-007, SCR-008 |
| 관련 테스트케이스 | TC-AR-019 ~ TC-AR-022 |

---

### 3.4 의사 기능 (DCR: Doctor Requirement)

#### DCR-001: 의사 대시보드
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DCR-001 |
| 요구사항명 | 의사 대시보드 |
| 우선순위 | High |
| 설명 | 의사가 담당 환자의 전반적 현황을 대시보드로 확인할 수 있어야 한다 |
| 상세 요구사항 | - 감정 요약 (담당 환자 전체 감정 분포)<br>- 일일 일기 작성 건수<br>- 월별 감정 추이 그래프<br>- 최근 활동 내역 (최신 일기·분석)<br>- 중증 환자(patientStatus=2) 목록 강조 표시<br>- DOCTOR 권한 전용 (/doctor/**) |
| 관련 유스케이스 | UC-DOCTOR-001 |
| 관련 화면 | SCR-010 |
| 관련 테스트케이스 | TC-DCR-001 ~ TC-DCR-010 |

#### DCR-002: 환자 통계 조회
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DCR-002 |
| 요구사항명 | 환자별 감정 통계 |
| 우선순위 | High |
| 설명 | 의사가 특정 환자의 상세 감정 통계를 조회할 수 있어야 한다 |
| 상세 요구사항 | - 월별 감정 평균 비율 조회<br>- 일일 감정 변화 추이<br>- 부정 감정 집중일 표시 (불안·슬픔·분노·우울 비율 높은 날)<br>- 전체 지표 종합 요약<br>- /api/analyses/monthly 엔드포인트 (DOCTOR 권한) |
| 관련 유스케이스 | UC-DOCTOR-002 |
| 관련 화면 | SCR-012 |
| 관련 테스트케이스 | TC-DCR-011 ~ TC-DCR-018 |

#### DCR-003: 환자 일기 열람
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DCR-003 |
| 요구사항명 | 담당 환자 일기 목록/상세 열람 |
| 우선순위 | High |
| 설명 | 의사가 담당 환자의 일기를 열람할 수 있어야 한다 |
| 상세 요구사항 | - 배정된 환자의 일기 목록 조회<br>- 일기 상세 내용 및 감정 분석 결과 확인<br>- 환자 동의 기반 열람 (배정 관계 필요) |
| 관련 유스케이스 | UC-DOCTOR-003 |
| 관련 화면 | SCR-013 |
| 관련 테스트케이스 | TC-DCR-019 ~ TC-DCR-024 |

#### DCR-004: 환자 배정 관리
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DCR-004 |
| 요구사항명 | 의사-환자 배정(Arrange) 관리 |
| 우선순위 | High |
| 설명 | 의사가 환자를 자신에게 배정하거나 배정을 해제할 수 있어야 한다 |
| 상세 요구사항 | - 환자(USER) 배정 생성 (tb_arrange: id=환자FK, doctIdx=의사FK)<br>- 배정 목록 조회<br>- 배정 해제 (삭제)<br>- 배정은 예약이 아닌 담당 관계 설정 |
| 관련 유스케이스 | UC-DOCTOR-004 |
| 관련 화면 | SCR-011, SCR-014 |
| 관련 테스트케이스 | TC-DCR-025 ~ TC-DCR-032 |

#### DCR-005: 의사 정보 관리
| 항목 | 내용 |
|------|------|
| 요구사항 ID | DCR-005 |
| 요구사항명 | 의사 프로필 관리 |
| 우선순위 | Medium |
| 설명 | 의사의 전문 분야 및 소속 병원 정보를 관리할 수 있어야 한다 |
| 상세 요구사항 | - 의사 정보 등록 (소속 병원 hospIdx FK, 회원 id FK Unique, 전문 분야 specialty)<br>- 의사 정보 수정/조회<br>- 병원과의 연결 관계 관리 |
| 관련 유스케이스 | UC-DOCTOR-005 |
| 관련 화면 | SCR-015 |
| 관련 테스트케이스 | TC-DCR-033 ~ TC-DCR-038 |

---

### 3.5 병원 관리 (HR: Hospital Requirement)

#### HR-001: 병원 정보 등록
| 항목 | 내용 |
|------|------|
| 요구사항 ID | HR-001 |
| 요구사항명 | 병원 정보 등록 |
| 우선순위 | Medium |
| 설명 | 병원 정보를 시스템에 등록할 수 있어야 한다 |
| 상세 요구사항 | - 병원명 (hospName)<br>- 우편번호 (zipCode)<br>- 주소1 (addr1), 주소2 (addr2)<br>- 전화번호 (tel)<br>- 등록일 자동 기록 (createdAt) |
| 관련 유스케이스 | UC-HOSP-001 |
| 관련 화면 | SCR-016 |
| 관련 테스트케이스 | TC-HR-001 ~ TC-HR-006 |

#### HR-002: 병원 정보 조회/수정/삭제
| 항목 | 내용 |
|------|------|
| 요구사항 ID | HR-002 |
| 요구사항명 | 병원 정보 관리 |
| 우선순위 | Medium |
| 설명 | 등록된 병원 정보를 조회, 수정, 삭제할 수 있어야 한다 |
| 상세 요구사항 | - 병원 목록 조회<br>- 병원 상세 정보 조회<br>- 병원 정보 수정<br>- 병원 삭제 (소속 의사 없는 경우)<br>- Public 접근 가능 (API) |
| 관련 유스케이스 | UC-HOSP-002 |
| 관련 화면 | SCR-016 |
| 관련 테스트케이스 | TC-HR-007 ~ TC-HR-014 |

---

### 3.6 AI 챗봇 (CR: Chatbot Requirement)

#### CR-001: Simple 챗봇 (KoGPT2)
| 항목 | 내용 |
|------|------|
| 요구사항 ID | CR-001 |
| 요구사항명 | KoGPT2 기반 Simple 챗봇 |
| 우선순위 | High |
| 설명 | 사용자가 간단한 일상 대화를 AI 챗봇과 나눌 수 있어야 한다 |
| 상세 요구사항 | - FastAPI 서버의 /chatbot/g 엔드포인트 호출<br>- KoGPT2 모델 기반 자연어 응답 생성<br>- 간단한 감정 위로·일상 대화 지원 |
| 관련 유스케이스 | UC-CHAT-001 |
| 관련 화면 | SCR-009 |
| 관련 테스트케이스 | TC-CR-001 ~ TC-CR-005 |

#### CR-002: Complex 챗봇 (KoBERT)
| 항목 | 내용 |
|------|------|
| 요구사항 ID | CR-002 |
| 요구사항명 | KoBERT 기반 Complex 챗봇 |
| 우선순위 | High |
| 설명 | 사용자가 감정 기반 심층 상담을 AI 챗봇과 진행할 수 있어야 한다 |
| 상세 요구사항 | - FastAPI 서버의 /chatbot/b 엔드포인트 호출<br>- KoBERT 모델 기반 감정 인식 및 맞춤 응답<br>- 심층 심리 상담 대화 지원 |
| 관련 유스케이스 | UC-CHAT-002 |
| 관련 화면 | SCR-009 |
| 관련 테스트케이스 | TC-CR-006 ~ TC-CR-010 |

---

### 3.7 음악 추천 (MR: Music Requirement)

#### MR-001: 감정 기반 음악 추천
| 항목 | 내용 |
|------|------|
| 요구사항 ID | MR-001 |
| 요구사항명 | 감정 맞춤형 YouTube 음악 추천 |
| 우선순위 | Medium |
| 설명 | 분석된 감정에 맞는 음악을 YouTube에서 검색·추천해야 한다 |
| 상세 요구사항 | - FastAPI 서버의 /youtube/search 엔드포인트 호출<br>- 분석된 주요 감정 키워드 기반 검색<br>- Selenium 기반 YouTube 크롤링<br>- 영상 제목, 썸네일, 채널명, 조회수 표시 |
| 관련 유스케이스 | UC-MUSIC-001 |
| 관련 화면 | SCR-007 |
| 관련 테스트케이스 | TC-MR-001 ~ TC-MR-006 |

---

## 4. 비기능 요구사항

### 4.1 성능 요구사항 (PR: Performance Requirement)

| ID | 요구사항명 | 설명 | 목표치 |
|----|----------|------|--------|
| PR-001 | 페이지 로딩 속도 | 일반 페이지 초기 로딩 시간 | 2초 이내 |
| PR-002 | API 응답 시간 | 일반 REST API 요청 응답 시간 | 2초 이내 |
| PR-003 | AI 감정 분석 | KoBERT 감정 분석 응답 시간 | 5초 이내 |
| PR-004 | 챗봇 응답 | KoGPT2/KoBERT 챗봇 응답 시간 | 5초 이내 |
| PR-005 | 동시 접속자 | 동시 접속 가능 사용자 수 | 100명 이상 |

### 4.2 보안 요구사항 (SEC: Security Requirement)

| ID | 요구사항명 | 설명 |
|----|----------|------|
| SEC-001 | 세션 인증 | Spring Security Form Login + 서버 세션 기반 인증 |
| SEC-002 | 역할 기반 접근 제어 | 역할(USER/DOCTOR)에 따른 URL·기능 접근 제한 |
| SEC-003 | 비밀번호 암호화 | BCrypt 해시 알고리즘으로 비밀번호 저장 |
| SEC-004 | Public 경로 관리 | /, /login, /join, /calendar, 정적 리소스, 병원/회원 API는 인증 없이 접근 가능 |
| SEC-005 | DOCTOR 전용 경로 | /doctor/**, /api/members/users/**, /api/analyses/monthly는 DOCTOR 권한 필요 |
| SEC-006 | USER+DOCTOR 공용 경로 | /member/**, /api/members/info/**는 USER 또는 DOCTOR 권한 필요 |
| SEC-007 | SQL Injection 방지 | JPA/QueryDSL 파라미터 바인딩 사용 |
| SEC-008 | XSS 방지 | Thymeleaf 자동 이스케이프, 사용자 입력값 검증 |

### 4.3 사용성 요구사항 (UX: Usability Requirement)

| ID | 요구사항명 | 설명 |
|----|----------|------|
| UX-001 | 직관적 UI | 캘린더 기반 일기 관리로 직관적 접근 |
| UX-002 | 감정 시각화 | 차트·색상으로 감정 상태를 시각적으로 표현 |
| UX-003 | 실시간 피드백 | 입력 검증·로딩 상태 실시간 표시 |
| UX-004 | 에러 메시지 | 사용자 친화적 에러 메시지 표시 |

### 4.4 호환성 요구사항 (CP: Compatibility Requirement)

| ID | 요구사항명 | 설명 |
|----|----------|------|
| CP-001 | 브라우저 호환 | Chrome, Firefox, Edge 최신 버전 지원 |
| CP-002 | Java 환경 | Java 17 LTS 기반 |
| CP-003 | DB 호환 | MySQL 8.0 이상 |

---

## 5. 데이터 요구사항

### 5.1 데이터 모델

#### 회원 (tb_member)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|---------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 회원 고유 ID |
| user_id | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 아이디 |
| password | VARCHAR(255) | NOT NULL | 암호화된 비밀번호 (BCrypt) |
| name | VARCHAR(255) | NOT NULL | 이름 |
| email | VARCHAR(255) | NOT NULL | 이메일 |
| phone | VARCHAR(255) | | 연락처 |
| zip_code | VARCHAR(255) | | 우편번호 |
| addr1 | VARCHAR(255) | | 주소1 |
| addr2 | VARCHAR(255) | | 주소2 |
| agreement_yn | VARCHAR(1) | | 약관 동의 여부 (Y/N) |
| role | VARCHAR(50) | NOT NULL | 역할 (USER / DOCTOR) |
| joined_at | DATETIME | | 가입일 |
| profile_img | VARCHAR(255) | | 프로필 이미지 파일명 |
| patient_status | INT | | 환자 심각도 (1=경증, 2=중증) |

#### 일기 (tb_diary)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|---------|------|
| diary_idx | BIGINT | PK, AUTO_INCREMENT | 일기 고유 ID |
| id | BIGINT | FK (tb_member.id), NOT NULL | 작성자 회원 ID |
| diary_title | VARCHAR(255) | | 일기 제목 |
| diary_content | TEXT | | 일기 내용 |
| file1 | VARCHAR(255) | | 첨부파일 1 |
| file2 | VARCHAR(255) | | 첨부파일 2 |
| file3 | VARCHAR(255) | | 첨부파일 3 |
| created_at | DATETIME | | 작성일 |

#### 감정 분석 (tb_analysis)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|---------|------|
| analysis_idx | BIGINT | PK, AUTO_INCREMENT | 분석 고유 ID |
| diary_idx | BIGINT | FK (tb_diary.diary_idx), UNIQUE | 일기 ID (1:1) |
| model_name | VARCHAR(255) | | 분석 모델명 |
| anxiety_ratio | DECIMAL(4,1) | | 불안 비율 (0.0~100.0) |
| sadness_ratio | DECIMAL(4,1) | | 슬픔 비율 |
| joy_ratio | DECIMAL(4,1) | | 기쁨 비율 |
| anger_ratio | DECIMAL(4,1) | | 분노 비율 |
| regret_ratio | DECIMAL(4,1) | | 후회 비율 |
| hope_ratio | DECIMAL(4,1) | | 희망 비율 |
| neutrality_ratio | DECIMAL(4,1) | | 중립 비율 |
| tiredness_ratio | DECIMAL(4,1) | | 피로 비율 |
| depression_ratio | DECIMAL(4,1) | | 우울 비율 |
| created_at | DATETIME | | 분석일 |

#### 배정 (tb_arrange)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|---------|------|
| arrange_idx | BIGINT | PK, AUTO_INCREMENT | 배정 고유 ID |
| id | BIGINT | FK (tb_member.id), NOT NULL | 환자(USER) 회원 ID |
| doct_idx | BIGINT | FK (tb_doctor.doct_idx), NOT NULL | 담당 의사 ID |
| created_at | DATETIME | | 배정일 |

#### 의사 (tb_doctor)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|---------|------|
| doct_idx | BIGINT | PK, AUTO_INCREMENT | 의사 고유 ID |
| hosp_idx | BIGINT | FK (tb_hospital.hosp_idx) | 소속 병원 ID |
| id | BIGINT | FK (tb_member.id), UNIQUE | 회원 ID (1:1) |
| specialty | VARCHAR(255) | | 전문 분야 |
| created_at | DATETIME | | 등록일 |

#### 병원 (tb_hospital)
| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|---------|------|
| hosp_idx | BIGINT | PK, AUTO_INCREMENT | 병원 고유 ID |
| hosp_name | VARCHAR(255) | NOT NULL | 병원명 |
| zip_code | VARCHAR(255) | | 우편번호 |
| addr1 | VARCHAR(255) | | 주소1 |
| addr2 | VARCHAR(255) | | 주소2 |
| tel | VARCHAR(255) | | 전화번호 |
| created_at | DATETIME | | 등록일 |

### 5.2 엔티티 관계 요약

| 관계 | 설명 |
|------|------|
| tb_member → tb_diary | 1:N (한 회원이 여러 일기 작성) |
| tb_diary → tb_analysis | 1:1 (일기 하나에 분석 하나, Unique FK) |
| tb_member → tb_doctor | 1:1 (회원-의사 연결, Unique FK) |
| tb_hospital → tb_doctor | 1:N (한 병원에 여러 의사 소속) |
| tb_member → tb_arrange | 1:N (한 환자가 여러 배정 가능) |
| tb_doctor → tb_arrange | 1:N (한 의사가 여러 환자 배정 가능) |

---

## 6. 인터페이스 요구사항

### 6.1 화면 목록

| ID | 화면명 | 경로 | 접근 권한 | 설명 |
|----|--------|------|----------|------|
| SCR-001 | 로그인 | /login | Public | 사용자 로그인 |
| SCR-002 | 회원가입 | /join | Public | 신규 사용자 가입 |
| SCR-003 | 캘린더 | /calendar | Public | 월별 캘린더 + 일기 표시 |
| SCR-004 | 마이페이지 | /member/mypage | USER, DOCTOR | 개인정보 관리 |
| SCR-005 | 일기 작성 | /member/diary/write | USER, DOCTOR | 감정 일기 작성 폼 |
| SCR-006 | 일기 목록 | /member/diary/list | USER, DOCTOR | 사용자별 일기 목록 |
| SCR-007 | 일기 상세 | /member/diary/detail | USER, DOCTOR | 일기 내용 + 감정 분석 결과 |
| SCR-008 | 감정 통계 | /member/stats | USER, DOCTOR | 감정 변화 추이 차트 |
| SCR-009 | AI 챗봇 | /member/chatbot | USER, DOCTOR | Simple/Complex 챗봇 대화 |
| SCR-010 | 의사 대시보드 | /doctor/dashboard | DOCTOR | 환자 현황 종합 대시보드 |
| SCR-011 | 환자 목록 | /doctor/patients | DOCTOR | 담당 환자 목록 + 배정 |
| SCR-012 | 환자 통계 | /doctor/patient/stats | DOCTOR | 환자별 감정 상세 통계 |
| SCR-013 | 환자 일기 열람 | /doctor/patient/diaries | DOCTOR | 담당 환자 일기 목록/상세 |
| SCR-014 | 배정 관리 | /doctor/arrange | DOCTOR | 의사-환자 배정 관리 |
| SCR-015 | 의사 정보 | /doctor/profile | DOCTOR | 의사 프로필·전문분야 관리 |
| SCR-016 | 병원 관리 | /hospital | Public (API) | 병원 정보 CRUD |

### 6.2 API 인터페이스

#### 인증 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | /login | Spring Security Form Login | Public |
| POST | /join | 회원가입 처리 | Public |
| POST | /logout | 로그아웃 | 인증 사용자 |

#### 회원 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| GET | /api/members/info/{id} | 회원 정보 조회 | USER, DOCTOR |
| PUT | /api/members/info/{id} | 회원 정보 수정 | USER, DOCTOR |
| POST | /api/members/profile-img | 프로필 이미지 업로드 | USER, DOCTOR |
| GET | /api/members/users | USER 역할 회원 목록 | DOCTOR |
| GET | /api/members/users/{id} | 특정 USER 상세 조회 | DOCTOR |

#### 일기 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | /api/diaries | 일기 작성 | USER, DOCTOR |
| GET | /api/diaries | 일기 목록 조회 (본인) | USER, DOCTOR |
| GET | /api/diaries/{diaryIdx} | 일기 상세 조회 | USER, DOCTOR |
| PUT | /api/diaries/{diaryIdx} | 일기 수정 | USER, DOCTOR |
| DELETE | /api/diaries/{diaryIdx} | 일기 삭제 | USER, DOCTOR |
| GET | /api/diaries/member/{id} | 특정 회원 일기 목록 | DOCTOR |

#### 감정 분석 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | /api/analyses | 감정 분석 요청 및 저장 | USER, DOCTOR |
| GET | /api/analyses/diary/{diaryIdx} | 일기별 분석 결과 조회 | USER, DOCTOR |
| GET | /api/analyses/monthly | 월별 감정 통계 조회 | DOCTOR |
| GET | /api/analyses/member/{id} | 특정 회원 분석 목록 | DOCTOR |

#### 배정 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | /api/arranges | 환자 배정 생성 | DOCTOR |
| GET | /api/arranges/doctor/{doctIdx} | 의사별 배정 목록 | DOCTOR |
| GET | /api/arranges/member/{id} | 환자별 배정 조회 | USER, DOCTOR |
| DELETE | /api/arranges/{arrangeIdx} | 배정 해제 | DOCTOR |

#### 병원 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | /api/hospitals | 병원 등록 | Public |
| GET | /api/hospitals | 병원 목록 조회 | Public |
| GET | /api/hospitals/{hospIdx} | 병원 상세 조회 | Public |
| PUT | /api/hospitals/{hospIdx} | 병원 정보 수정 | Public |
| DELETE | /api/hospitals/{hospIdx} | 병원 삭제 | Public |

#### 의사 API
| Method | Endpoint | 설명 | 접근 권한 |
|--------|----------|------|----------|
| POST | /api/doctors | 의사 정보 등록 | DOCTOR |
| GET | /api/doctors/{doctIdx} | 의사 정보 조회 | DOCTOR |
| PUT | /api/doctors/{doctIdx} | 의사 정보 수정 | DOCTOR |
| GET | /api/doctors/member/{id} | 회원 ID로 의사 조회 | DOCTOR |

#### FastAPI AI 서버 API (외부)
| Method | Endpoint | 설명 | 서버 |
|--------|----------|------|------|
| GET | /diary?s={text} | 일기 감정 분석 (9감정 비율) | 192.168.0.16:8000 |
| GET | /chatbot/g?s={text} | Simple 챗봇 (KoGPT2) | 192.168.0.16:8000 |
| GET | /chatbot/b?s={text} | Complex 챗봇 (KoBERT) | 192.168.0.16:8000 |
| POST | /youtube/search | 감정 기반 음악 검색 | 192.168.0.16:8000 |

---

## 7. 환경설정

### 7.1 주요 설정 항목

| 항목 | 설명 | 기본값 | 필수 |
|------|------|--------|------|
| server.port | 웹 서버 포트 | 8083 | O |
| spring.datasource.url | MySQL 접속 URL | jdbc:mysql://localhost:3306/office_mate | O |
| spring.datasource.username | DB 사용자명 | root | O |
| spring.datasource.password | DB 비밀번호 | 12345 | O |
| spring.jpa.hibernate.ddl-auto | DDL 전략 | update | O |
| spring.servlet.multipart.max-file-size | 파일 업로드 최대 크기 | 10MB | X |
| file.upload-dir | 파일 업로드 경로 | C:/dodak | O |
| ai.server.url | FastAPI AI 서버 URL | http://192.168.0.16:8000 | O |
| spring.mail.* | SMTP 이메일 설정 | (disabled) | X |

### 7.2 설정 파일 예시 (application.properties)

```properties
# 서버 설정
server.port=8083

# 데이터베이스 설정
spring.datasource.url=jdbc:mysql://localhost:3306/office_mate?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=12345
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 설정
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# 파일 업로드 설정
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=C:/dodak

# AI 서버 설정
ai.server.url=http://192.168.0.16:8000

# 이메일 설정 (기본 비활성)
# spring.mail.host=smtp.gmail.com
# spring.mail.port=587
```

---

## 8. 제약사항

### 8.1 기술적 제약사항
- Java 17 LTS 및 Spring Boot 3.5.7 환경 필수
- AI 감정 분석 서버(FastAPI)는 별도 서버(192.168.0.16)에서 운영, KoBERT 모델은 GPU 권장
- 파일 업로드 저장 경로는 C:/dodak 고정 (Windows 환경)
- QueryDSL 5.0.0은 Jakarta Persistence API 호환 버전 사용
- MySQL 8.0 이상 필요 (office_mate 데이터베이스)

### 8.2 운영 제약사항
- 의사-환자 배정(Arrange)은 예약 시스템이 아닌 담당 관계 설정 기능
- 감정 분석은 FastAPI 서버 가용 시에만 동작
- 프로필 이미지, 일기 첨부파일은 로컬 디스크 저장 (클라우드 미지원)
- 이메일 SMTP는 기본 비활성 상태 (필요 시 application.properties에서 활성화)

### 8.3 보안 제약사항
- Spring Security Form Login + 서버 세션 기반 인증 (JWT 미사용)
- Public 경로: /, /login, /join, /calendar, 정적 리소스(/css/**, /js/**, /images/**), /api/hospitals/**, /api/members/join
- DOCTOR 전용 경로: /doctor/**, /api/members/users/**, /api/analyses/monthly
- USER+DOCTOR 공용 경로: /member/**, /api/members/info/**
- 그 외 모든 경로는 인증 필요

---

## 9. 감정 분석 상세

### 9.1 9가지 감정 분류

| 감정 | 영문명 | 필드명 | 설명 |
|------|--------|--------|------|
| 불안 | anxiety | anxiety_ratio | 걱정, 두려움, 불안감 |
| 슬픔 | sadness | sadness_ratio | 우울, 외로움, 슬픈 감정 |
| 기쁨 | joy | joy_ratio | 행복, 즐거움, 긍정적 감정 |
| 분노 | anger | anger_ratio | 화남, 짜증, 분노 |
| 후회 | regret | regret_ratio | 아쉬움, 자책, 미안함 |
| 희망 | hope | hope_ratio | 기대, 낙관, 미래에 대한 긍정 |
| 중립 | neutrality | neutrality_ratio | 특별한 감정 없음, 평온 |
| 피로 | tiredness | tiredness_ratio | 지침, 무기력, 탈진 |
| 우울 | depression | depression_ratio | 만성적 우울감, 의욕 저하 |

### 9.2 감정 분석 응답 예시

```json
{
  "anxiety": 10.5,
  "sadness": 15.0,
  "joy": 25.5,
  "anger": 5.0,
  "regret": 6.0,
  "hope": 12.0,
  "neutrality": 10.0,
  "tiredness": 8.5,
  "depression": 7.5
}
```

---

## 10. 관련 문서

| 문서 | 설명 |
|------|------|
| [TECH_STACK.md](./TECH_STACK.md) | 기술 스택 |
| [FUNCTIONAL_SPECIFICATION.md](./FUNCTIONAL_SPECIFICATION.md) | 기능 명세서 |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | API 명세서 |
| [USE_CASES.md](./USE_CASES.md) | 유스케이스 명세서 |
| [SCREEN_DESIGN.md](./SCREEN_DESIGN.md) | 화면 설계서 |
| [TEST_CASES.md](./TEST_CASES.md) | 테스트 케이스 |
| [INTEGRATION_TEST_CASES.md](./INTEGRATION_TEST_CASES.md) | 통합 테스트 케이스 |

---

## 문서 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|----------|
| 1.0 | 2026-02-03 | 최대영 | 최초 작성 |
| 1.1 | 2026-02-09 | 최대영 | 관련 문서 링크 추가 |
| 1.2 | 2026-02-09 | 박제연 | 의사 기능(DCR), 환자 배정, 대시보드 요구사항 추가. 9가지 감정(우울 포함) 정정. 데이터 모델·API·화면 목록 실제 구현 기반 전면 최신화 |
