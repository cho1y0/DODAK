/**
 * patient-stats.js - 환자 통계 페이지 JavaScript
 */

(function() {
    'use strict';

    let MEMBER_ID;
    let pieChart, lineChart;
    let currentYear, currentMonth;
    let selectedPatientId = null;
    let cachedDiaries = []; // 차트 데이터 캐시
    let diaryByDay = {}; // 날짜별 일기 데이터
    let diaryDetailModal; // 모달 인스턴스

    // 환자 목록 로드
    async function loadPatientList() {
        if (!MEMBER_ID) return Promise.resolve();

        try {
            const response = await fetch(`/api/members/users/assigned/${MEMBER_ID}`);

            // 204 No Content 또는 빈 응답 처리
            let patients = [];
            if (response.ok && response.status !== 204) {
                patients = await response.json();
            }

            const patientSelect = document.getElementById('patientSelect');
            if (patientSelect) {
                patientSelect.innerHTML = '<option value="" disabled selected>환자 선택</option>';
                patients.forEach(patient => {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    patientSelect.appendChild(option);
                });

                patientSelect.addEventListener('change', function() {
                    selectedPatientId = this.value;
                    loadPatientStats(selectedPatientId);
                });
            }
            return Promise.resolve();
        } catch (error) {
            console.error('환자 목록 로드 실패:', error);
            return Promise.resolve();
        }
    }

    // 환자 통계 로드
    async function loadPatientStats(patientId) {
        if (!patientId) return;

        try {
            const response = await fetch(`/api/diaries/list/${patientId}?page=0&size=31`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ year: currentYear, month: currentMonth })
            });
            const data = await response.json();

            if (data.content) {
                updateStatsDisplay(data.content);
                updateCalendar(data.content);
                updateCharts(data.content);
                updateTopDiaries(data.content);
            }
        } catch (error) {
            console.error('환자 통계 로드 실패:', error);
        }
    }

    // 통계 표시 업데이트
    function updateStatsDisplay(diaries) {
        if (diaries.length === 0) {
            document.getElementById('depressionBar').style.width = '0%';
            document.getElementById('happinessBar').style.width = '0%';
            document.getElementById('depressionLevel').textContent = '-단계';
            document.getElementById('happinessLevel').textContent = '-단계';
            document.getElementById('analysisNote').textContent = '이번 달 일기가 없습니다.';
            return;
        }

        const avgDepression = diaries.reduce((sum, d) => sum + (d.depressionRatio || 0), 0) / diaries.length;
        const avgHappiness = diaries.reduce((sum, d) => sum + (d.joyRatio || 0), 0) / diaries.length;

        document.getElementById('depressionBar').style.width = avgDepression + '%';
        document.getElementById('happinessBar').style.width = avgHappiness + '%';

        const depressionLevel = avgDepression < 20 ? 1 : avgDepression < 40 ? 2 : avgDepression < 60 ? 3 : avgDepression < 80 ? 4 : 5;
        const happinessLevel = avgHappiness < 20 ? 1 : avgHappiness < 40 ? 2 : avgHappiness < 60 ? 3 : avgHappiness < 80 ? 4 : 5;

        document.getElementById('depressionLevel').textContent = depressionLevel + '단계';
        document.getElementById('happinessLevel').textContent = happinessLevel + '단계';

        const depressionStatus = document.getElementById('depressionStatus');
        const happinessStatus = document.getElementById('happinessStatus');

        if (avgDepression >= 60) {
            depressionStatus.textContent = '주의 필요 😟';
            depressionStatus.style.color = '#d0021b';
        } else if (avgDepression >= 40) {
            depressionStatus.textContent = '보통 😐';
            depressionStatus.style.color = '#f5a623';
        } else {
            depressionStatus.textContent = '양호 😊';
            depressionStatus.style.color = '#69a74e';
        }

        if (avgHappiness >= 60) {
            happinessStatus.textContent = '양호 😊';
            happinessStatus.style.color = '#69a74e';
        } else if (avgHappiness >= 40) {
            happinessStatus.textContent = '보통 😐';
            happinessStatus.style.color = '#f5a623';
        } else {
            happinessStatus.textContent = '주의 필요 😟';
            happinessStatus.style.color = '#d0021b';
        }

        document.getElementById('analysisNote').textContent = `이번 달 ${diaries.length}개의 일기를 분석했습니다.`;
    }

    // 달력 업데이트
    function updateCalendar(diaries) {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;

        // 달력 헤더 유지하고 날짜 셀만 제거
        const headers = calendarGrid.querySelectorAll('.calendar-header');
        calendarGrid.innerHTML = '';
        headers.forEach(h => calendarGrid.appendChild(h));

        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const startDayOfWeek = (firstDay.getDay() + 6) % 7; // 월요일 시작

        // 빈 셀 추가
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDiv = document.createElement('div');
            calendarGrid.appendChild(emptyDiv);
        }

        // 일기 데이터를 날짜별로 매핑 (전역 변수에 저장)
        diaryByDay = {};
        diaries.forEach(diary => {
            const date = new Date(diary.createdAt);
            const day = date.getDate();
            if (!diaryByDay[day]) {
                diaryByDay[day] = [];
            }
            diaryByDay[day].push(diary);
        });

        // 날짜 셀 추가
        const today = new Date();
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            dayDiv.textContent = day;

            if (today.getFullYear() === currentYear &&
                today.getMonth() + 1 === currentMonth &&
                today.getDate() === day) {
                dayDiv.classList.add('today');
            }

            if (diaryByDay[day]) {
                const avgMood = calculateAvgMood(diaryByDay[day]);
                dayDiv.style.backgroundColor = getMoodColor(avgMood);
                dayDiv.style.color = 'white';
                dayDiv.style.cursor = 'pointer';
                dayDiv.dataset.day = day;

                // 클릭 이벤트 추가
                dayDiv.addEventListener('click', function() {
                    const clickedDay = parseInt(this.dataset.day);
                    const dayDiaries = diaryByDay[clickedDay];
                    if (dayDiaries && dayDiaries.length > 0) {
                        // 해당 날짜의 첫 번째 일기 표시
                        showDiaryModal(dayDiaries[0]);
                    }
                });
            }

            calendarGrid.appendChild(dayDiv);
        }
    }

    // 평균 감정 계산
    function calculateAvgMood(diaries) {
        const totals = {
            joy: 0, sadness: 0, anger: 0, anxiety: 0, depression: 0
        };

        diaries.forEach(d => {
            totals.joy += d.joyRatio || 0;
            totals.sadness += d.sadnessRatio || 0;
            totals.anger += d.angerRatio || 0;
            totals.anxiety += d.anxietyRatio || 0;
            totals.depression += d.depressionRatio || 0;
        });

        return Object.entries(totals).reduce((max, [mood, value]) =>
            value > max.value ? { mood, value } : max, { mood: 'joy', value: 0 }
        ).mood;
    }

    // 감정에 따른 색상 반환
    function getMoodColor(mood) {
        const colors = {
            joy: 'var(--mood-joy)',
            sadness: 'var(--mood-sad)',
            anger: 'var(--mood-anger)',
            anxiety: 'var(--mood-anxiety)',
            depression: '#483D8B',
            regret: 'var(--mood-regret)'
        };
        return colors[mood] || '#ccc';
    }

    // 차트 업데이트
    function updateCharts(diaries) {
        cachedDiaries = diaries; // 데이터 캐시

        // 현재 활성화된 탭 확인
        const pieTab = document.getElementById('pie-tab');
        const lineTab = document.getElementById('line-tab');

        // 파이 차트 탭이 활성화된 경우
        if (pieTab && pieTab.classList.contains('active')) {
            updatePieChart(diaries);
        }

        // 라인 차트 탭이 활성화된 경우
        if (lineTab && lineTab.classList.contains('active')) {
            updateLineChart(diaries);
        }
    }

    // 파이 차트 업데이트
    function updatePieChart(diaries) {
        const ctx = document.getElementById('pie-chart');
        if (!ctx) return;

        if (pieChart) {
            pieChart.destroy();
        }

        const totals = {
            anxiety: 0, sadness: 0, joy: 0, anger: 0,
            regret: 0, hope: 0, tiredness: 0, depression: 0, neutrality: 0
        };

        diaries.forEach(d => {
            totals.anxiety += d.anxietyRatio || 0;
            totals.sadness += d.sadnessRatio || 0;
            totals.joy += d.joyRatio || 0;
            totals.anger += d.angerRatio || 0;
            totals.regret += d.regretRatio || 0;
            totals.hope += d.hopeRatio || 0;
            totals.tiredness += d.tirednessRatio || 0;
            totals.depression += d.depressionRatio || 0;
            totals.neutrality += d.neutralityRatio || 0;
        });

        pieChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['불안', '슬픔', '기쁨', '분노', '후회', '희망', '피로', '우울', '중립'],
                datasets: [{
                    data: Object.values(totals),
                    backgroundColor: [
                        '#FFA500', '#4169E1', '#FFD700', '#DC143C',
                        '#9370DB', '#90EE90', '#808080', '#483D8B', '#C0C0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // 라인 차트 업데이트
    function updateLineChart(diaries) {
        const ctx = document.getElementById('line-chart');
        if (!ctx) return;

        if (lineChart) {
            lineChart.destroy();
        }

        // 날짜별로 정렬
        const sortedDiaries = [...diaries].sort((a, b) =>
            new Date(a.createdAt) - new Date(b.createdAt)
        );

        const labels = sortedDiaries.map(d => {
            const date = new Date(d.createdAt);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const happinessData = sortedDiaries.map(d => d.joyRatio || 0);
        const depressionData = sortedDiaries.map(d => d.depressionRatio || 0);

        lineChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '행복 지수',
                        data: happinessData,
                        borderColor: '#FFD700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: '우울 지수',
                        data: depressionData,
                        borderColor: '#483D8B',
                        backgroundColor: 'rgba(72, 61, 139, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // TOP 3 부정적 일기 업데이트
    function updateTopDiaries(diaries) {
        const container = document.getElementById('topDiaryList');
        if (!container) return;

        if (diaries.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">일기가 없습니다.</p>';
            return;
        }

        // 우울 지수 기준 정렬
        const sortedByDepression = [...diaries].sort((a, b) =>
            (b.depressionRatio || 0) - (a.depressionRatio || 0)
        );

        const topDiaries = sortedByDepression.slice(0, 3);

        container.innerHTML = topDiaries.map((d, i) => {
            const date = new Date(d.createdAt).toLocaleDateString('ko-KR');
            return `
                <div class="top-diary-item p-2 mb-2 border rounded" data-diary-idx="${d.diaryIdx}" style="cursor: pointer;">
                    <div class="d-flex justify-content-between">
                        <strong>${i + 1}. ${d.diaryTitle}</strong>
                        <span class="text-muted">${date}</span>
                    </div>
                    <small class="text-danger">우울 지수: ${d.depressionRatio || 0}%</small>
                </div>
            `;
        }).join('');

        // 클릭 이벤트 추가
        container.querySelectorAll('.top-diary-item').forEach((item, index) => {
            item.addEventListener('click', function() {
                showDiaryModal(topDiaries[index]);
            });
        });
    }

    // 일기 상세 모달 표시
    function showDiaryModal(diary) {
        if (!diary || !diaryDetailModal) return;

        const modalTitle = document.getElementById('diaryDetailModalLabel');
        const modalDateInfo = document.getElementById('modal-date-info');
        const modalContent = document.getElementById('modal-diary-content');
        const modalAnalysisResult = document.getElementById('modal-analysis-result');

        // 날짜 포맷
        const dateString = diary.createdAt.replace(/\+00:00$/, 'Z');
        const dateObject = new Date(dateString);
        const detailedDate = dateObject.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            weekday: "long", hour: "2-digit", minute: "2-digit", second: "2-digit"
        });

        // 모달 내용 채우기
        if (modalTitle) modalTitle.textContent = diary.diaryTitle;

        if (modalDateInfo) {
            modalDateInfo.innerHTML = `
                <span class="badge bg-primary me-2">작성자: ${diary.memberName || '미확인'}</span>
                <span class="badge bg-secondary">${detailedDate}</span>
            `;
        }

        if (modalContent) modalContent.textContent = diary.diaryContent;

        if (modalAnalysisResult) {
            let analysisHtml = '<p class="text-muted">분석 결과가 없습니다.</p>';
            if (diary.modelName) {
                analysisHtml = `
                    <p><strong>모델:</strong> ${diary.modelName}</p>
                    <h6>감정 비율 (%)</h6>
                    <ul class="list-unstyled d-flex flex-wrap">
                        <li class="me-3">불안: <strong>${diary.anxietyRatio || 0}%</strong></li>
                        <li class="me-3">슬픔: <strong>${diary.sadnessRatio || 0}%</strong></li>
                        <li class="me-3">기쁨: <strong>${diary.joyRatio || 0}%</strong></li>
                        <li class="me-3">분노: <strong>${diary.angerRatio || 0}%</strong></li>
                        <li class="me-3">후회: <strong>${diary.regretRatio || 0}%</strong></li>
                        <li class="me-3">희망: <strong>${diary.hopeRatio || 0}%</strong></li>
                        <li class="me-3">중립: <strong>${diary.neutralityRatio || 0}%</strong></li>
                        <li class="me-3">피곤: <strong>${diary.tirednessRatio || 0}%</strong></li>
                        <li class="me-3">우울: <strong>${diary.depressionRatio || 0}%</strong></li>
                    </ul>
                `;
            }
            modalAnalysisResult.innerHTML = analysisHtml;
        }

        diaryDetailModal.show();
    }

    // 달력 네비게이션 설정
    function setupCalendarNavigation() {
        const prevBtn = document.querySelector('.month-prev-btn');
        const nextBtn = document.querySelector('.month-next-btn');
        const yearSelect = document.getElementById('yearSelect');
        const monthDisplay = document.getElementById('currentMonthDisplay');

        // 연도 셀렉트 초기화
        const currentDate = new Date();
        currentYear = currentDate.getFullYear();
        currentMonth = currentDate.getMonth() + 1;

        if (yearSelect) {
            for (let y = currentYear - 5; y <= currentYear + 1; y++) {
                const option = document.createElement('option');
                option.value = y;
                option.textContent = y + '년';
                if (y === currentYear) option.selected = true;
                yearSelect.appendChild(option);
            }

            yearSelect.addEventListener('change', function() {
                currentYear = parseInt(this.value);
                updateMonthDisplay();
                if (selectedPatientId) {
                    loadPatientStats(selectedPatientId);
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentMonth--;
                if (currentMonth < 1) {
                    currentMonth = 12;
                    currentYear--;
                    if (yearSelect) yearSelect.value = currentYear;
                }
                updateMonthDisplay();
                if (selectedPatientId) {
                    loadPatientStats(selectedPatientId);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentMonth++;
                if (currentMonth > 12) {
                    currentMonth = 1;
                    currentYear++;
                    if (yearSelect) yearSelect.value = currentYear;
                }
                updateMonthDisplay();
                if (selectedPatientId) {
                    loadPatientStats(selectedPatientId);
                }
            });
        }

        updateMonthDisplay();
    }

    function updateMonthDisplay() {
        const monthDisplay = document.getElementById('currentMonthDisplay');
        if (monthDisplay) {
            monthDisplay.textContent = currentMonth + '월';
        }
    }

    // 탭 전환 이벤트 설정
    function setupChartTabs() {
        const pieTab = document.getElementById('pie-tab');
        const lineTab = document.getElementById('line-tab');

        if (pieTab) {
            pieTab.addEventListener('shown.bs.tab', function() {
                if (cachedDiaries.length > 0) {
                    updatePieChart(cachedDiaries);
                }
            });
        }

        if (lineTab) {
            lineTab.addEventListener('shown.bs.tab', function() {
                if (cachedDiaries.length > 0) {
                    updateLineChart(cachedDiaries);
                }
            });
        }
    }

    // 초기화
    function initialize() {
        const memberIdEl = document.getElementById('memberId');
        MEMBER_ID = memberIdEl ? memberIdEl.value : null;

        if (!MEMBER_ID) {
            console.error('로그인한 사용자 정보를 찾을 수 없습니다.');
            return;
        }

        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth() + 1;

        // 모달 초기화
        const modalElement = document.getElementById('diaryDetailModal');
        if (modalElement) {
            diaryDetailModal = new bootstrap.Modal(modalElement);
        }

        setupCalendarNavigation();
        setupChartTabs(); // 탭 이벤트 설정 추가
        loadPatientList().then(() => {
            // URL 파라미터에서 환자 ID 확인 (중증 환자 알림에서 이동 시)
            const urlParams = new URLSearchParams(window.location.search);
            const patientIdParam = urlParams.get('patientId');
            if (patientIdParam) {
                const patientSelect = document.getElementById('patientSelect');
                if (patientSelect) {
                    patientSelect.value = patientIdParam;
                    selectedPatientId = patientIdParam;
                    loadPatientStats(patientIdParam);
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();
