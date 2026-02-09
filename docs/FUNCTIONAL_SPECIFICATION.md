# Dodak 기능명세서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | Dodak (AI 기반 감정 일기 & 심리 케어 플랫폼) |
| 문서 버전 | 1.2 |
| 작성일 | 2026-02-09 |
| 작성자 | 박제연 (백엔드) |

---

## 목차

1. [인증 및 사용자 관리](#1-인증-및-사용자-관리)
2. [회원 홈 화면](#2-회원-홈-화면)
3. [일기 관리](#3-일기-관리)
4. [감정 분석](#4-감정-분석)
5. [의사 대시보드](#5-의사-대시보드)
6. [의사 환자 관리](#6-의사-환자-관리)
7. [병원 관리](#7-병원-관리)
8. [AI 챗봇](#8-ai-챗봇)
9. [음악 추천](#9-음악-추천)
10. [비밀번호 재설정](#10-비밀번호-재설정)

---

## 1. 인증 및 사용자 관리

### 1.1 회원가입

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-001 |
| 화면 경로 | `/join` |
| API 엔드포인트 | `POST /api/members/join` (multipart/form-data) |
| 접근 권한 | Public (비로그인 사용자) |

#### 입력 항목

| 필드명 | 타입 | 필수 | 검증 규칙 | 설명 |
|--------|------|------|----------|------|
| userId | VARCHAR(50) | O | 50자 이내, 중복 불가 | 로그인 ID |
| password | VARCHAR | O | 8자 이상, 영문+숫자 | 비밀번호 (BCrypt 해싱 저장) |
| name | VARCHAR(50) | O | 50자 이내 | 사용자 이름 |
| email | VARCHAR | O | 이메일 형식 | 이메일 주소 |
| phone | VARCHAR(20) | O | 20자 이내 | 전화번호 |
| zipCode | VARCHAR(6) | O | 6자리 | 우편번호 |
| addr1 | VARCHAR(255) | O | 255자 이내 | 기본 주소 |
| addr2 | VARCHAR(255) | O | 255자 이내 | 상세 주소 |
| agreementYn | CHAR(1) | O | 'Y' 필수 | 약관 동의 여부 |
| profileImage | File | X | 이미지 파일 | 프로필 이미지 |

#### 처리 로직

1. 클라이언트에서 입력값 유효성 검증 (실시간)
2. 아이디 중복 확인 (`GET /api/members/checkId?userId={userId}`)
3. 이메일 중복 확인 (`GET /api/members/checkEmail?email={email}`)
4. 비밀번호 BCrypt 해싱 처리
5. 프로필 이미지가 있는 경우 UUID 파일명으로 서버에 저장 (`C:/dodak`)
6. `tb_member` 테이블에 신규 레코드 삽입 (role 기본값: `USER`)
7. 성공 시 로그인 페이지로 리다이렉트

#### 출력

| 상태 | 응답 |
|------|------|
| 성공 | 회원가입 완료 메시지 + 로그인 페이지 리다이렉트 |
| 아이디 중복 | 중복 알림 메시지 |
| 이메일 중복 | 중복 알림 메시지 |

---

### 1.2 아이디 중복 확인

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-002 |
| API 엔드포인트 | `GET /api/members/checkId?userId={userId}` |
| 접근 권한 | Public |

- 사용 가능 시 `true`, 중복 시 `false` 반환

---

### 1.3 이메일 중복 확인

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-003 |
| API 엔드포인트 | `GET /api/members/checkEmail?email={email}` |
| 접근 권한 | Public |

- 사용 가능 시 `true`, 중복 시 `false` 반환

---

### 1.4 로그인

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-004 |
| 화면 경로 | `/login` |
| API 엔드포인트 | `POST /loginProc` (Spring Security form login) |
| 접근 권한 | Public |

#### 입력 항목

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| username | String | O | 로그인 아이디 (userId) |
| password | String | O | 비밀번호 |

#### 처리 로직

1. Spring Security `UsernamePasswordAuthenticationFilter` 가 `/loginProc` 요청 처리
2. `CustomUserDetailsService`에서 userId로 사용자 조회
3. BCrypt로 비밀번호 검증
4. 인증 성공 시 `CustomAuthSuccessHandler`에서 역할별 리다이렉트:
   - `USER` → `/member/home`
   - `DOCTOR` → `/doctor/home`
5. 인증 실패 시 `/login?error` 로 리다이렉트

#### 출력

| 상태 | 응답 |
|------|------|
| 성공 (USER) | `/member/home`으로 리다이렉트 |
| 성공 (DOCTOR) | `/doctor/home`으로 리다이렉트 |
| 실패 | `/login?error`로 리다이렉트 + 오류 메시지 |

---

### 1.5 로그아웃

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-005 |
| API 엔드포인트 | Spring Security 기본 로그아웃 |
| 접근 권한 | USER, DOCTOR |

#### 처리 로직

1. Spring Security 세션 무효화
2. `/login` 페이지로 리다이렉트

---

### 1.6 회원정보 수정

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-006 |
| 화면 경로 | `/member/mypage` 또는 `/doctor/mypage` |
| API 엔드포인트 | `PUT /api/members/update` (multipart/form-data) |
| 접근 권한 | USER, DOCTOR |

#### 수정 가능 항목

| 필드명 | 타입 | 설명 |
|--------|------|------|
| password | String | 비밀번호 변경 (BCrypt 해싱) |
| name | String | 이름 변경 |
| phone | String | 전화번호 변경 |
| zipCode | String | 우편번호 변경 |
| addr1 | String | 기본 주소 변경 |
| addr2 | String | 상세 주소 변경 |
| profileImage | File | 프로필 이미지 변경 (UUID 파일명, `C:/dodak` 저장) |

#### 수정 불가 항목

| 필드명 | 사유 |
|--------|------|
| userId | 로그인 ID (변경 불가) |
| email | 고유 식별자 (변경 불가) |
| role | 시스템 관리 항목 (변경 불가) |

---

### 1.7 회원 삭제

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-007 |
| API 엔드포인트 | `DELETE /api/members/{id}` |
| 접근 권한 | USER, DOCTOR |

- 회원 레코드 삭제 (관련 데이터 cascade 처리)

---

### 1.8 회원 정보 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-AUTH-008 |
| API 엔드포인트 | `GET /api/members/info/{memberId}` |
| 접근 권한 | USER, DOCTOR |

#### 응답 (MemberInfoResponse)

| 필드 | 설명 |
|------|------|
| memberId | 회원 PK |
| userId | 로그인 ID |
| name | 이름 |
| email | 이메일 |
| phone | 전화번호 |
| role | 역할 (USER / DOCTOR) |
| profileImage | 프로필 이미지 경로 |

---

## 2. 회원 홈 화면

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-HOME-001 |
| 화면 경로 | `/member/home` |
| 접근 권한 | USER |

### 2.1 화면 구성

- 오늘 작성한 일기 요약 표시 (`GET /api/diaries/today/{memberId}`)
- 최근 감정 분석 결과 하이라이트
- 일기 작성, 일기 목록, 챗봇, 음악 추천 등 주요 기능 바로가기
- 캘린더 바로가기 (`/calendar`)

---

### 2.2 오늘의 일기 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-HOME-002 |
| API 엔드포인트 | `GET /api/diaries/today/{memberId}` |
| 접근 권한 | USER |

- 오늘 날짜 기준으로 작성된 일기 존재 여부 및 요약 데이터 반환
- 일기가 없으면 작성 유도 메시지 표시

---

## 3. 일기 관리

### 3.1 일기 작성

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-001 |
| 화면 경로 | `/member/diary-write` |
| API 엔드포인트 | `POST /api/diaries` |
| 접근 권한 | USER |

#### 입력 항목

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| diaryTitle | VARCHAR(255) | O | 일기 제목 |
| diaryContent | TEXT | O | 일기 본문 |
| memberId | INT | O | 작성자 회원 PK |

#### 처리 로직

1. 일기 내용 입력 및 유효성 검증
2. `tb_diary` 테이블에 일기 저장
3. FastAPI 감정 분석 API 호출 (`GET http://192.168.0.16:8000/diary?s={diaryContent}`)
4. AI 응답에서 9가지 감정 비율 추출
5. `tb_analysis` 테이블에 분석 결과 저장 (일기 1:1 연결)
6. 결과 화면으로 리다이렉트

#### AI 분석 API 호출

| 항목 | 내용 |
|------|------|
| 호출 URL | `GET http://192.168.0.16:8000/diary?s={content}` |
| 응답 형식 | 9가지 감정 비율 (DECIMAL 4,1) |

#### 9가지 감정 목록

| 감정 (영문) | 감정 (한글) | 데이터 타입 |
|------------|-----------|-----------|
| anxiety | 불안 | DECIMAL(4,1) |
| sadness | 슬픔 | DECIMAL(4,1) |
| joy | 기쁨 | DECIMAL(4,1) |
| anger | 분노 | DECIMAL(4,1) |
| regret | 후회 | DECIMAL(4,1) |
| hope | 희망 | DECIMAL(4,1) |
| neutrality | 중립 | DECIMAL(4,1) |
| tiredness | 피로 | DECIMAL(4,1) |
| depression | 우울 | DECIMAL(4,1) |

#### 출력

| 상태 | 응답 |
|------|------|
| 성공 | 일기 저장 + 분석 결과 반환 |
| AI 서버 연결 실패 | 일기만 저장, 분석은 기본값(중립 100%) 적용 |

---

### 3.2 일기 수정

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-002 |
| API 엔드포인트 | `PUT /api/diaries/{diaryIdx}` |
| 접근 권한 | USER |

#### 처리 로직

1. 일기 내용 수정
2. `tb_diary` 테이블 업데이트
3. FastAPI 감정 분석 API 재호출
4. 기존 분석 결과를 새 분석 결과로 교체
5. 수정된 결과 반환

---

### 3.3 일기 상세 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-003 |
| API 엔드포인트 | `GET /api/diaries/{diaryIdx}` |
| 접근 권한 | USER, DOCTOR |

- 일기 기본 정보 (제목, 내용, 작성일) 반환

---

### 3.4 일기 + 분석 상세 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-004 |
| API 엔드포인트 | `GET /api/diaries/detail/{diaryId}` |
| 접근 권한 | USER, DOCTOR |

- 일기 정보 + 연결된 감정 분석 결과를 함께 반환

#### 응답 구조

| 필드 | 설명 |
|------|------|
| diary | 일기 정보 (diaryIdx, diaryTitle, diaryContent, createdAt 등) |
| analysis | 분석 결과 (9가지 감정 비율) |

---

### 3.5 회원별 일기 목록 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-005 |
| 화면 경로 | `/member/diary-list` |
| API 엔드포인트 | `GET /api/diaries/member/{memberId}` |
| 접근 권한 | USER |

- 해당 회원의 전체 일기 목록을 최신순으로 반환

---

### 3.6 일기 목록 조회 (페이징 + 검색)

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-006 |
| API 엔드포인트 | `POST /api/diaries/list/{memberId}` |
| 접근 권한 | USER, DOCTOR |

#### 요청 파라미터

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | INT | 0 | 페이지 번호 (0-based) |
| size | INT | 10 | 페이지당 항목 수 |
| year | INT | null | 조회 연도 필터 |
| month | INT | null | 조회 월 필터 |
| day | INT | null | 조회 일 필터 |
| keyword | String | null | 제목/내용 검색어 |
| selectedMemberId | INT | null | 특정 환자 ID (의사가 환자 일기 조회 시) |

#### 응답 구조

- 페이징 처리된 일기 목록 + 페이지 정보 반환

---

### 3.7 일기 삭제

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DIARY-007 |
| API 엔드포인트 | `DELETE /api/diaries/{diaryIdx}` |
| 접근 권한 | USER |

#### 처리 로직

1. 해당 일기의 분석 결과도 함께 삭제 (cascade)
2. `tb_diary` 레코드 삭제

---

## 4. 감정 분석

### 4.1 분석 결과 생성

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-001 |
| API 엔드포인트 | `POST /api/analyses` |
| 접근 권한 | 시스템 내부 (일기 작성 시 자동 호출) |

- 일기 작성/수정 시 `DiaryService.writeDiaryAndAnalyze()` 에서 자동 실행
- FastAPI AI 서버 호출 후 9가지 감정 비율을 `tb_analysis`에 저장

---

### 4.2 분석 결과 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-002 |
| API 엔드포인트 | `GET /api/analyses/{analysisIdx}` |
| 접근 권한 | USER, DOCTOR |

- 특정 분석 결과의 9가지 감정 비율 반환

---

### 4.3 일기별 분석 결과 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-003 |
| API 엔드포인트 | `GET /api/analyses/diary/{diaryIdx}` |
| 접근 권한 | USER, DOCTOR |

- 특정 일기에 연결된 분석 결과 반환

---

### 4.4 월별 분석 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-004 |
| API 엔드포인트 | `GET /api/analyses/monthly?memberId={id}&year={year}&month={month}` |
| 접근 권한 | USER, DOCTOR |

- 특정 회원의 해당 연/월 전체 분석 결과 목록 반환
- 캘린더 뷰에서 날짜별 감정 표시에 활용

---

### 4.5 환자 월간 통계

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-005 |
| 화면 경로 | `/doctor/patient-stats` |
| API 엔드포인트 | `GET /api/analyses/stats/{memberId}?year={year}&month={month}` |
| 접근 권한 | DOCTOR |

#### 응답 (PatientStatsResponse)

| 키 | 타입 | 설명 |
|----|------|------|
| emotionAverages | EmotionAverages | 해당 월 9가지 감정 평균값 |
| dailyEmotions | List&lt;DailyEmotion&gt; | 일별 감정 추이 데이터 (차트용) |
| negativeDays | List&lt;NegativeDayInfo&gt; | 부정 감정(불안, 슬픔, 분노, 우울) 비율이 높은 날짜 목록 |
| overallIndicators | OverallIndicators | 전체 심리 건강 지표 요약 |

#### EmotionAverages 구조

| 필드 | 설명 |
|------|------|
| anxiety | 불안 평균 |
| sadness | 슬픔 평균 |
| joy | 기쁨 평균 |
| anger | 분노 평균 |
| regret | 후회 평균 |
| hope | 희망 평균 |
| neutrality | 중립 평균 |
| tiredness | 피로 평균 |
| depression | 우울 평균 |

#### OverallIndicators 구조

| 필드 | 설명 |
|------|------|
| totalDiaryCount | 해당 월 총 일기 수 |
| averageNegativeRatio | 부정 감정 평균 비율 |
| maxNegativeDate | 부정 감정 최고치 날짜 |
| dominantEmotion | 해당 월 지배적 감정 |

---

### 4.6 의사 대시보드 통계

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-006 |
| 화면 경로 | `/doctor/dashboard` |
| API 엔드포인트 | `GET /api/analyses/dashboard/{memberId}` |
| 접근 권한 | DOCTOR |

#### 응답 (DashboardStatsResponse)

| 키 | 타입 | 설명 |
|----|------|------|
| emotionSummary | EmotionSummary | 담당 환자 전체 감정 집계 |
| dailyDiaryCounts | List&lt;DailyDiaryCount&gt; | 일별 일기 작성 수 추이 |
| monthlyEmotionTrend | List&lt;MonthlyEmotionTrend&gt; | 월별 감정 변화 추이 (차트용) |
| recentDiaryActivity | List&lt;RecentDiaryActivity&gt; | 최근 일기 활동 목록 |
| severePatients | List&lt;SeverePatientInfo&gt; | 중증 환자 목록 (patientStatus=2) |

#### EmotionSummary 구조

| 필드 | 설명 |
|------|------|
| totalPatients | 담당 환자 수 |
| totalDiaries | 전체 일기 수 |
| avgAnxiety | 평균 불안 |
| avgSadness | 평균 슬픔 |
| avgJoy | 평균 기쁨 |
| avgDepression | 평균 우울 |

---

### 4.7 분석 결과 수정

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-007 |
| API 엔드포인트 | `PUT /api/analyses/{analysisIdx}` |
| 접근 권한 | DOCTOR |

- 의사가 AI 분석 결과를 수동으로 보정할 때 사용

---

### 4.8 분석 결과 삭제

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-ANALYSIS-008 |
| API 엔드포인트 | `DELETE /api/analyses/{analysisIdx}` |
| 접근 권한 | DOCTOR |

---

## 5. 의사 대시보드

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCT-001 |
| 화면 경로 | `/doctor/home` |
| 접근 권한 | DOCTOR |

### 5.1 의사 홈 화면

- 담당 환자 현황 요약
- 중증 환자 알림 (patientStatus=2)
- 대시보드, 환자 통계, 환자 일기 목록 바로가기

---

### 5.2 대시보드 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCT-002 |
| 화면 경로 | `/doctor/dashboard` |
| API 엔드포인트 | `GET /api/analyses/dashboard/{memberId}` |
| 접근 권한 | DOCTOR |

- 의사 본인의 memberId를 기준으로 담당 환자 전체 통계 조회
- 감정 요약, 일기 작성 추이, 월별 감정 추세, 중증 환자 목록 표시
- 상세 응답 구조는 [FN-ANALYSIS-006](#46-의사-대시보드-통계) 참조

---

### 5.3 환자 통계 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCT-003 |
| 화면 경로 | `/doctor/patient-stats` |
| API 엔드포인트 | `GET /api/analyses/stats/{memberId}?year={year}&month={month}` |
| 접근 권한 | DOCTOR |

- 특정 환자의 월간 감정 통계 조회
- 감정 평균, 일별 추이 차트, 부정 감정 고위험일, 전체 지표 표시
- 상세 응답 구조는 [FN-ANALYSIS-005](#45-환자-월간-통계) 참조

---

### 5.4 환자 일기 목록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCT-004 |
| 화면 경로 | `/doctor/patient-diary-list` |
| API 엔드포인트 | `POST /api/diaries/list/{memberId}` |
| 접근 권한 | DOCTOR |

- 의사가 담당 환자의 일기 목록을 페이징/검색 조회
- `selectedMemberId` 파라미터로 특정 환자 지정
- 상세 파라미터는 [FN-DIARY-006](#36-일기-목록-조회-페이징--검색) 참조

---

## 6. 의사 환자 관리

### 6.1 의사 등록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-001 |
| API 엔드포인트 | `POST /api/doctors` |
| 접근 권한 | DOCTOR |

#### 입력 항목

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| memberId | INT | O | 회원 PK (FK → tb_member) |
| hospIdx | INT | O | 소속 병원 PK (FK → tb_hospital) |
| specialty | VARCHAR | O | 전문 분야 |

---

### 6.2 의사 조회

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-002 |
| API 엔드포인트 | `GET /api/doctors/{doctIdx}` |
| 접근 권한 | DOCTOR |

- 의사 상세 정보 반환 (회원 정보 + 소속 병원 + 전문 분야)

---

### 6.3 병원별 의사 목록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-003 |
| API 엔드포인트 | `GET /api/doctors/hospital/{hospIdx}` |
| 접근 권한 | Public |

- 특정 병원 소속 의사 목록 반환

---

### 6.4 의사 삭제

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-004 |
| API 엔드포인트 | `DELETE /api/doctors/{doctIdx}` |
| 접근 권한 | DOCTOR |

---

### 6.5 미배정 환자 목록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-005 |
| API 엔드포인트 | `GET /api/members/users/unassigned/{memberId}` |
| 접근 권한 | DOCTOR |

- 의사에게 아직 배정되지 않은 USER 역할의 환자 목록 반환
- `memberId`는 의사 본인의 회원 PK

---

### 6.6 배정 환자 목록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-006 |
| API 엔드포인트 | `GET /api/members/users/assigned/{memberId}` |
| 접근 권한 | DOCTOR |

- 해당 의사에게 배정된 환자 목록 반환

---

### 6.7 환자 배정 저장

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-007 |
| API 엔드포인트 | `POST /api/members/assignments` |
| 접근 권한 | DOCTOR |

#### 처리 로직

1. 의사가 미배정 환자 목록에서 환자를 선택
2. 선택된 환자들을 의사-환자 배정 관계로 저장
3. 배정된 환자는 미배정 목록에서 제거, 배정 목록에 추가

---

### 6.8 환자 상태 토글

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-008 |
| API 엔드포인트 | `PATCH /api/members/{id}/patient-status` |
| 접근 권한 | DOCTOR |

#### 환자 상태 코드

| 상태값 | 설명 |
|--------|------|
| 1 | 경증 (mild) |
| 2 | 중증 (severe) |

- 의사가 환자의 심리 상태를 경증/중증으로 토글 전환
- 중증 환자는 대시보드의 중증 환자 목록에 표시

---

### 6.9 중증 환자 목록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-009 |
| API 엔드포인트 | `GET /api/members/severe/{memberId}` |
| 접근 권한 | DOCTOR |

- 해당 의사의 담당 환자 중 patientStatus=2 (중증)인 환자 목록 반환

---

### 6.10 담당 배정 관리 (Arrangement)

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-DOCTOR-010 |
| API 베이스 경로 | `/api/arrangements` |
| 접근 권한 | DOCTOR |

#### API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/arrangements` | 환자-의사 배정 생성 (patientMemberId, doctIdx) |
| GET | `/api/arrangements/{arrangeIdx}` | 배정 상세 조회 |
| GET | `/api/arrangements/patient/{memberId}` | 환자별 배정 의사 조회 |
| GET | `/api/arrangements/doctor/{doctIdx}` | 의사별 배정 환자 조회 |
| DELETE | `/api/arrangements/{arrangeIdx}` | 배정 해제 |

---

## 7. 병원 관리

### 7.1 병원 등록

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-HOSP-001 |
| API 엔드포인트 | HospitalRestController |
| 접근 권한 | DOCTOR |

#### 입력 항목

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| hospName | VARCHAR(50) | O | 병원명 |
| hospZipCode | VARCHAR(6) | O | 우편번호 |
| hospAddr1 | VARCHAR(255) | O | 기본 주소 |
| hospAddr2 | VARCHAR(255) | O | 상세 주소 |
| hospPhone | VARCHAR(20) | O | 전화번호 |

---

### 7.2 병원 조회/수정/삭제

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-HOSP-002 |
| 접근 권한 | DOCTOR |

- 표준 CRUD API (HospitalController, HospitalRestController)

---

## 8. AI 챗봇

### 8.1 Simple 챗봇 (KoGPT2)

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-CHAT-001 |
| 화면 경로 | `/view/chatbot` (또는 관련 뷰 페이지) |
| API 엔드포인트 | `GET /chatbot/g?s={사용자 입력}` (FastAPI) |
| 접근 권한 | USER |

#### 처리 로직

1. 사용자 메시지 입력
2. FastAPI 서버의 KoGPT2 모델로 전달
3. 가벼운 일상 대화 및 감정 공감 응답 생성
4. 응답 반환

#### 출력

```json
{
  "answer": "많이 힘드시군요. 괜찮아요, 여기에 모든 것을 털어놓아도 좋습니다."
}
```

---

### 8.2 Complex 챗봇 (KoBERT)

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-CHAT-002 |
| 접근 권한 | USER |

#### 특별 응답 케이스

| 감지 키워드 | 응답 유형 |
|-------------|-----------|
| 화가, 분노 | 분노 조절 가이드 |
| 우울, 죽고 | 전문 상담 연결 안내 |
| 불안, 걱정 | 안정화 기법 안내 |

- 심층 심리 상담용 챗봇
- 감정 분류 기반 맞춤 응답 생성
- 위험 키워드 감지 시 전문 상담 연결 안내

---

## 9. 음악 추천

### 9.1 감정 기반 음악 검색

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-MUSIC-001 |
| 접근 권한 | USER |

#### 감정-검색어 매핑

| 감정 | 검색어 |
|------|--------|
| 분노 (anger) | 분노 가라앉히는 음악 |
| 불안 (anxiety) | 불안할때 듣는 노래 |
| 슬픔 (sadness) | 슬플때 듣는 노래 |
| 기쁨 (joy) | 기쁠때 듣는 노래 |
| 후회 (regret) | 후회할때 듣는노래 |
| 희망 (hope) | 희망찬 브금 |
| 중립 (neutrality) | 머릿속이 복잡할때 듣는 노래 |
| 피로 (tiredness) | 지치고 힘들때 듣는 노래 |
| 우울 (depression) | 우울함을 달래줄 노래 |

#### 처리 로직

1. 감정 분석 결과에서 가장 높은 비율의 감정 추출
2. 해당 감정에 매핑된 검색어로 YouTube 검색 (Selenium 크롤링)
3. 검색 결과 반환

#### 응답 데이터

```json
{
  "keyword": "슬픔",
  "results": [
    {
      "name": "영상 제목",
      "thumnail": "썸네일 URL",
      "link": "https://youtube.com/watch?v=...",
      "viewCount": "100만회",
      "videoDate": "1년 전",
      "videoAuthor": "채널명",
      "videoAuthorImg": "채널 이미지 URL",
      "videoDescript": "영상 설명"
    }
  ],
  "time": "2026-02-09 14:30:00"
}
```

---

## 10. 비밀번호 재설정

### 10.1 비밀번호 재설정 요청

| 항목 | 내용 |
|------|------|
| 기능 ID | FN-PWD-001 |
| 컨트롤러 | PasswordResetController |
| 접근 권한 | Public |

#### 처리 로직

1. 사용자가 등록된 이메일 입력
2. 이메일 존재 여부 확인
3. 비밀번호 재설정 링크를 이메일로 발송 (SMTP)
4. 링크 클릭 시 비밀번호 재설정 화면으로 이동
5. 새 비밀번호 입력 후 BCrypt 해싱하여 업데이트

---

## 부록 A: 페이지 경로 매핑

### Public 페이지

| 화면 | 경로 | 접근 권한 | 컨트롤러 |
|------|------|----------|---------|
| 인덱스 | `/` | Public | MainController |
| 로그인 | `/login` | Public | MainController |
| 회원가입 | `/join` | Public | MainController |
| 캘린더 | `/calendar` | Public | MainController |
| 뷰 페이지 | `/view/{viewPage}` | Public | MainController |

### 회원 (USER) 페이지

| 화면 | 경로 | 접근 권한 | 컨트롤러 |
|------|------|----------|---------|
| 회원 홈 | `/member/home` | USER | MainController |
| 일기 작성 | `/member/diary-write` | USER | MainController |
| 일기 목록 | `/member/diary-list` | USER | MainController |
| 마이페이지 | `/member/mypage` | USER | MainController |

### 의사 (DOCTOR) 페이지

| 화면 | 경로 | 접근 권한 | 컨트롤러 |
|------|------|----------|---------|
| 의사 홈 | `/doctor/home` | DOCTOR | MainController |
| 대시보드 | `/doctor/dashboard` | DOCTOR | MainController |
| 환자 통계 | `/doctor/patient-stats` | DOCTOR | MainController |
| 환자 일기 목록 | `/doctor/patient-diary-list` | DOCTOR | MainController |
| 마이페이지 | `/doctor/mypage` | DOCTOR | MainController |

---

## 부록 B: API 엔드포인트 요약

### MemberRestController (`/api/members`)

| 메서드 | 경로 | 기능 ID | 설명 |
|--------|------|---------|------|
| POST | `/join` | FN-AUTH-001 | 회원가입 (multipart) |
| PUT | `/update` | FN-AUTH-006 | 회원정보 수정 (multipart) |
| GET | `/checkId` | FN-AUTH-002 | 아이디 중복 확인 |
| GET | `/checkEmail` | FN-AUTH-003 | 이메일 중복 확인 |
| GET | `/info/{memberId}` | FN-AUTH-008 | 회원 정보 조회 |
| GET | `/users/unassigned/{memberId}` | FN-DOCTOR-005 | 미배정 환자 목록 |
| GET | `/users/assigned/{memberId}` | FN-DOCTOR-006 | 배정 환자 목록 |
| POST | `/assignments` | FN-DOCTOR-007 | 환자 배정 저장 |
| PATCH | `/{id}/patient-status` | FN-DOCTOR-008 | 환자 상태 토글 |
| GET | `/severe/{memberId}` | FN-DOCTOR-009 | 중증 환자 목록 |
| DELETE | `/{id}` | FN-AUTH-007 | 회원 삭제 |

### DiaryRestController (`/api/diaries`)

| 메서드 | 경로 | 기능 ID | 설명 |
|--------|------|---------|------|
| POST | `/` | FN-DIARY-001 | 일기 작성 + AI 분석 |
| PUT | `/{diaryIdx}` | FN-DIARY-002 | 일기 수정 + 재분석 |
| GET | `/{diaryIdx}` | FN-DIARY-003 | 일기 상세 조회 |
| GET | `/detail/{diaryId}` | FN-DIARY-004 | 일기 + 분석 상세 조회 |
| GET | `/member/{memberId}` | FN-DIARY-005 | 회원별 일기 목록 |
| POST | `/list/{memberId}` | FN-DIARY-006 | 일기 목록 (페이징 + 검색) |
| GET | `/today/{memberId}` | FN-HOME-002 | 오늘의 일기 조회 |
| DELETE | `/{diaryIdx}` | FN-DIARY-007 | 일기 삭제 |

### AnalysisRestController (`/api/analyses`)

| 메서드 | 경로 | 기능 ID | 설명 |
|--------|------|---------|------|
| POST | `/` | FN-ANALYSIS-001 | 분석 결과 생성 |
| GET | `/{analysisIdx}` | FN-ANALYSIS-002 | 분석 결과 조회 |
| GET | `/diary/{diaryIdx}` | FN-ANALYSIS-003 | 일기별 분석 조회 |
| GET | `/monthly` | FN-ANALYSIS-004 | 월별 분석 조회 |
| GET | `/stats/{memberId}` | FN-ANALYSIS-005 | 환자 월간 통계 |
| GET | `/dashboard/{memberId}` | FN-ANALYSIS-006 | 의사 대시보드 통계 |
| PUT | `/{analysisIdx}` | FN-ANALYSIS-007 | 분석 결과 수정 |
| DELETE | `/{analysisIdx}` | FN-ANALYSIS-008 | 분석 결과 삭제 |

### DoctorRestController (`/api/doctors`)

| 메서드 | 경로 | 기능 ID | 설명 |
|--------|------|---------|------|
| POST | `/` | FN-DOCTOR-001 | 의사 등록 |
| GET | `/{doctIdx}` | FN-DOCTOR-002 | 의사 조회 |
| GET | `/hospital/{hospIdx}` | FN-DOCTOR-003 | 병원별 의사 목록 |
| DELETE | `/{doctIdx}` | FN-DOCTOR-004 | 의사 삭제 |

### ArrangeRestController (`/api/arrangements`)

| 메서드 | 경로 | 기능 ID | 설명 |
|--------|------|---------|------|
| POST | `/` | FN-DOCTOR-010 | 배정 생성 |
| GET | `/{arrangeIdx}` | FN-DOCTOR-010 | 배정 상세 조회 |
| GET | `/patient/{memberId}` | FN-DOCTOR-010 | 환자별 배정 조회 |
| GET | `/doctor/{doctIdx}` | FN-DOCTOR-010 | 의사별 배정 조회 |
| DELETE | `/{arrangeIdx}` | FN-DOCTOR-010 | 배정 해제 |

---

## 부록 C: 사용자 역할 정의

| 역할 | 코드 | 권한 |
|------|------|------|
| 환자 (일반 사용자) | USER | 일기 작성/조회, 감정 분석, 챗봇, 음악 추천, 마이페이지 |
| 의사 | DOCTOR | 환자 배정/관리, 환자 일기 조회, 대시보드, 환자 통계, 환자 상태 관리, 마이페이지 |

---

## 부록 D: 에러 처리

### 에러 코드

| HTTP 코드 | 상황 | 설명 |
|----------|------|------|
| 200 | 성공 | 요청 처리 완료 |
| 302 | 리다이렉트 | 로그인 성공/실패 시 페이지 이동 |
| 400 | 잘못된 요청 | 입력값 검증 실패, 중복 데이터 |
| 401 | 인증 실패 | 미인증 상태로 보호된 리소스 접근 |
| 403 | 권한 없음 | 역할 권한 부족 |
| 404 | 미존재 | 요청한 리소스를 찾을 수 없음 |
| 500 | 서버 오류 | 내부 서버 오류 |

### AI 분석 실패 시 대응

1. FastAPI 서버 연결 실패
   - 일기는 정상 저장
   - 분석 결과는 기본값 적용 (neutrality: 100%, 나머지: 0%)
   - 로그 기록

2. 분석 결과 파싱 실패
   - 기본값 적용 (neutrality: 100%, 나머지: 0%)
   - 로그 기록

---

## 부록 E: 비즈니스 규칙

### 일기 관련

| 규칙 ID | 규칙 내용 |
|---------|-----------|
| BR-D01 | 일기는 본인만 작성/수정/삭제 가능 (담당 의사는 조회만 가능) |
| BR-D02 | 일기 삭제 시 관련 분석 결과도 함께 삭제 |
| BR-D03 | 일기 작성/수정 시 자동으로 AI 감정 분석 실행 |

### 분석 관련

| 규칙 ID | 규칙 내용 |
|---------|-----------|
| BR-A01 | 일기 1개당 분석 결과 1개 (1:1 관계) |
| BR-A02 | 분석 실패 시 기본값 (중립 100%) 적용 |
| BR-A03 | 9가지 감정 비율의 합은 100%를 구성 |

### 환자 관리 관련

| 규칙 ID | 규칙 내용 |
|---------|-----------|
| BR-P01 | 의사만 환자 배정/해제 가능 |
| BR-P02 | 의사만 환자 상태(경증/중증) 변경 가능 |
| BR-P03 | 의사는 담당 환자의 일기만 조회 가능 |

---

## 부록 F: 인증 구조

| 항목 | 내용 |
|------|------|
| 인증 방식 | Spring Security 폼 기반 세션 인증 |
| 로그인 처리 URL | `/loginProc` |
| 비밀번호 암호화 | BCrypt |
| CSRF | 비활성화 |
| 세션 관리 | Spring Security 기본 세션 |
| 인증 성공 핸들러 | CustomAuthSuccessHandler (역할별 리다이렉트) |
| 사용자 상세 서비스 | CustomUserDetailsService (userId 기반 조회) |

---

## 관련 문서

| 문서 | 설명 |
|------|------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 요구사항 정의서 |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | API 명세서 |
| [USE_CASES.md](./USE_CASES.md) | 유스케이스 명세서 |
| [SCREEN_DESIGN.md](./SCREEN_DESIGN.md) | 화면 설계서 |
| [TEST_CASES.md](./TEST_CASES.md) | 테스트 케이스 |

---

## 문서 이력

| 버전 | 변경일 | 변경자 | 변경 내용 |
|------|--------|--------|----------|
| 1.0 | 2026-02-03 | 박제연 | 최초 작성 |
| 1.1 | 2026-02-09 | 박제연 | 관련 문서 링크 추가 |
| 1.2 | 2026-02-09 | 박제연 | 의사 대시보드·환자 통계·환자 배정 기능 추가, 9가지 감정 정정, API 경로·요청/응답 구조 실제 구현 기반 전면 최신화 |
