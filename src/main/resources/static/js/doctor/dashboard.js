/**
 * dashboard.js - 의사 대시보드 페이지 JavaScript
 */

(function() {
    'use strict';

    let MEMBER_ID;
    let emotionPieChart, weeklyLineChart, monthlyBarChart;
    let diaryDetailModal;
    let allDiariesMap = {}; // diaryIdx를 키로 하는 일기 데이터 맵
    let allDiariesList = []; // 모든 일기 리스트 (차트용)

    // 대시보드 데이터 로드
    async function loadDashboardData() {
        if (!MEMBER_ID) return;

        try {
            // 담당 환자 목록 가져오기
            const patientsResponse = await fetch(`/api/members/users/assigned/${MEMBER_ID}`);

            // 204 No Content 또는 빈 응답 처리
            let patients = [];
            if (patientsResponse.ok && patientsResponse.status !== 204) {
                patients = await patientsResponse.json();
            }

            // 요약 카드 업데이트
            document.getElementById('dashTotalPatients').textContent = patients.length;

            // 각 환자의 일기 및 감정 데이터 집계
            let totalDiaries = 0;
            let thisMonthDiaries = 0;
            let severeCount = 0;
            let happinessSum = 0;
            const emotionTotals = {
                anxiety: 0, sadness: 0, joy: 0, anger: 0,
                regret: 0, hope: 0, tiredness: 0, depression: 0, neutrality: 0
            };
            const severePatients = [];
            const recentActivities = [];
            allDiariesList = []; // 초기화

            // 이번 달 기준 날짜
            const now = new Date();
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();

            for (const patient of patients) {
                try {
                    // 더 많은 일기를 가져오기 위해 size를 100으로 설정
                    const diariesResponse = await fetch(`/api/diaries/list/${patient.id}?page=0&size=100`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({})
                    });
                    const diaryData = await diariesResponse.json();

                    if (diaryData.content) {
                        totalDiaries += diaryData.page.totalElements;

                        diaryData.content.forEach(diary => {
                            emotionTotals.anxiety += diary.anxietyRatio || 0;
                            emotionTotals.sadness += diary.sadnessRatio || 0;
                            emotionTotals.joy += diary.joyRatio || 0;
                            emotionTotals.anger += diary.angerRatio || 0;
                            emotionTotals.regret += diary.regretRatio || 0;
                            emotionTotals.hope += diary.hopeRatio || 0;
                            emotionTotals.tiredness += diary.tirednessRatio || 0;
                            emotionTotals.depression += diary.depressionRatio || 0;
                            emotionTotals.neutrality += diary.neutralityRatio || 0;
                            happinessSum += diary.joyRatio || 0;

                            // 이번 달 일기 카운트
                            if (diary.createdAt) {
                                const diaryDate = new Date(diary.createdAt);
                                if (diaryDate.getMonth() === thisMonth && diaryDate.getFullYear() === thisYear) {
                                    thisMonthDiaries++;
                                }
                            }

                            // 일기 데이터 저장 (모달용)
                            allDiariesMap[diary.diaryIdx] = {
                                ...diary,
                                memberName: patient.name
                            };

                            // 차트용 일기 리스트에 추가
                            allDiariesList.push({
                                ...diary,
                                memberName: patient.name
                            });

                            // 최근 활동 추가
                            recentActivities.push({
                                diaryIdx: diary.diaryIdx,
                                name: patient.name,
                                title: diary.diaryTitle,
                                date: diary.createdAt,
                                mood: getMoodFromRatios(diary)
                            });
                        });

                        // 중증 환자 판별 (우울 지수 50% 이상)
                        const avgDepression = diaryData.content.length > 0
                            ? diaryData.content.reduce((sum, d) => sum + (d.depressionRatio || 0), 0) / diaryData.content.length
                            : 0;

                        if (avgDepression >= 50) {
                            severeCount++;
                            severePatients.push({
                                name: patient.name,
                                depressionIndex: avgDepression.toFixed(1),
                                lastDiary: diaryData.content[0]?.createdAt || '-',
                                status: avgDepression >= 70 ? 'severe' : 'warning'
                            });
                        }
                    }
                } catch (e) {
                    console.error(`환자 ${patient.id} 데이터 로드 실패:`, e);
                }
            }

            // 요약 카드 업데이트
            document.getElementById('dashSeverePatients').textContent = severeCount;
            document.getElementById('dashMonthlyDiaries').textContent = thisMonthDiaries;

            const diaryCount = allDiariesList.length;
            const avgHappiness = diaryCount > 0 ? (happinessSum / diaryCount).toFixed(1) : '-';
            document.getElementById('dashAvgHappiness').textContent = avgHappiness + '%';

            // 차트 업데이트 (실제 데이터 전달)
            updateEmotionPieChart(emotionTotals);
            updateWeeklyLineChart(allDiariesList);
            updateMonthlyBarChart(allDiariesList);

            // 중증 환자 테이블 업데이트
            updateSevereTable(severePatients);

            // 최근 활동 업데이트
            updateRecentActivity(recentActivities);

        } catch (error) {
            console.error('대시보드 데이터 로드 실패:', error);
        }
    }

    // 감정 비율에서 주요 감정 추출
    function getMoodFromRatios(diary) {
        const moods = [
            { name: 'anxiety', value: diary.anxietyRatio || 0 },
            { name: 'sadness', value: diary.sadnessRatio || 0 },
            { name: 'joy', value: diary.joyRatio || 0 },
            { name: 'anger', value: diary.angerRatio || 0 },
            { name: 'depression', value: diary.depressionRatio || 0 }
        ];
        return moods.reduce((max, m) => m.value > max.value ? m : max).name;
    }

    // 감정 분포 파이 차트
    function updateEmotionPieChart(totals) {
        const ctx = document.getElementById('dashEmotionPieChart');
        if (!ctx) return;

        if (emotionPieChart) {
            emotionPieChart.destroy();
        }

        emotionPieChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['불안', '슬픔', '기쁨', '분노', '후회', '희망', '피로', '우울', '중립'],
                datasets: [{
                    data: [
                        totals.anxiety, totals.sadness, totals.joy, totals.anger,
                        totals.regret, totals.hope, totals.tiredness, totals.depression, totals.neutrality
                    ],
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

    // 주간 일기 작성 추이 라인 차트 (실제 데이터)
    function updateWeeklyLineChart(diaries) {
        const ctx = document.getElementById('dashWeeklyLineChart');
        if (!ctx) return;

        if (weeklyLineChart) {
            weeklyLineChart.destroy();
        }

        const labels = [];
        const data = [];
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // 최근 7일간의 날짜별 일기 수 계산
        const dailyCounts = {};
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
            dailyCounts[dateKey] = 0;
        }

        // 일기 데이터에서 날짜별 카운트
        if (diaries && diaries.length > 0) {
            diaries.forEach(diary => {
                if (diary.createdAt) {
                    const diaryDate = new Date(diary.createdAt);
                    const dateKey = `${diaryDate.getFullYear()}-${String(diaryDate.getMonth() + 1).padStart(2, '0')}-${String(diaryDate.getDate()).padStart(2, '0')}`;
                    if (dailyCounts.hasOwnProperty(dateKey)) {
                        dailyCounts[dateKey]++;
                    }
                }
            });
        }

        // 데이터 배열 생성
        Object.keys(dailyCounts).sort().forEach(key => {
            data.push(dailyCounts[key]);
        });

        weeklyLineChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '일기 작성 수',
                    data: data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // 월별 감정 추이 바 차트 (실제 데이터)
    function updateMonthlyBarChart(diaries) {
        const ctx = document.getElementById('dashMonthlyBarChart');
        if (!ctx) return;

        if (monthlyBarChart) {
            monthlyBarChart.destroy();
        }

        // 최근 6개월 라벨 생성
        const labels = [];
        const monthlyData = {};
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = `${date.getMonth() + 1}월`;
            labels.push(monthLabel);
            monthlyData[monthKey] = {
                joy: [],
                depression: [],
                anxiety: []
            };
        }

        // 일기 데이터에서 월별 감정 수집
        if (diaries && diaries.length > 0) {
            diaries.forEach(diary => {
                if (diary.createdAt) {
                    const diaryDate = new Date(diary.createdAt);
                    const monthKey = `${diaryDate.getFullYear()}-${String(diaryDate.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData.hasOwnProperty(monthKey)) {
                        monthlyData[monthKey].joy.push(diary.joyRatio || 0);
                        monthlyData[monthKey].depression.push(diary.depressionRatio || 0);
                        monthlyData[monthKey].anxiety.push(diary.anxietyRatio || 0);
                    }
                }
            });
        }

        // 월별 평균 계산
        const joyData = [];
        const depressionData = [];
        const anxietyData = [];

        Object.keys(monthlyData).sort().forEach(key => {
            const month = monthlyData[key];
            joyData.push(month.joy.length > 0
                ? (month.joy.reduce((a, b) => a + b, 0) / month.joy.length).toFixed(1)
                : 0);
            depressionData.push(month.depression.length > 0
                ? (month.depression.reduce((a, b) => a + b, 0) / month.depression.length).toFixed(1)
                : 0);
            anxietyData.push(month.anxiety.length > 0
                ? (month.anxiety.reduce((a, b) => a + b, 0) / month.anxiety.length).toFixed(1)
                : 0);
        });

        monthlyBarChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '기쁨',
                        data: joyData,
                        backgroundColor: '#FFD700'
                    },
                    {
                        label: '우울',
                        data: depressionData,
                        backgroundColor: '#483D8B'
                    },
                    {
                        label: '불안',
                        data: anxietyData,
                        backgroundColor: '#FFA500'
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

    // 중증 환자 테이블 업데이트
    function updateSevereTable(patients) {
        const tbody = document.querySelector('#dashSevereTable tbody');
        if (!tbody) return;

        if (patients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">중증 환자가 없습니다.</td></tr>';
            return;
        }

        tbody.innerHTML = patients.map(p => {
            const dateStr = p.lastDiary !== '-'
                ? new Date(p.lastDiary).toLocaleDateString('ko-KR')
                : '-';
            return `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.depressionIndex}%</td>
                    <td>${dateStr}</td>
                    <td><span class="status-badge ${p.status}">${p.status === 'severe' ? '위험' : '주의'}</span></td>
                </tr>
            `;
        }).join('');
    }

    // 최근 활동 업데이트
    function updateRecentActivity(activities) {
        const container = document.getElementById('dashRecentActivity');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-3">최근 활동이 없습니다.</div>';
            return;
        }

        // 날짜순 정렬 (최신순)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        const topActivities = activities.slice(0, 10);

        container.innerHTML = topActivities.map(a => {
            const dateStr = new Date(a.date).toLocaleString('ko-KR');
            return `
                <div class="activity-item mood-${a.mood}" data-diary-idx="${a.diaryIdx}" style="cursor: pointer;">
                    <div class="activity-time">${dateStr}</div>
                    <div class="activity-name">${a.name}</div>
                    <div class="activity-title">${a.title}</div>
                </div>
            `;
        }).join('');

        // 클릭 이벤트 추가
        container.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', function() {
                const diaryIdx = this.dataset.diaryIdx;
                const diary = allDiariesMap[diaryIdx];
                if (diary) {
                    showDiaryModal(diary);
                }
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

    // 초기화
    function initialize() {
        const memberIdEl = document.getElementById('memberId');
        MEMBER_ID = memberIdEl ? memberIdEl.value : null;

        if (!MEMBER_ID) {
            console.error('로그인한 사용자 정보를 찾을 수 없습니다.');
            return;
        }

        // 모달 초기화
        const modalElement = document.getElementById('diaryDetailModal');
        if (modalElement) {
            diaryDetailModal = new bootstrap.Modal(modalElement);
        }

        loadDashboardData();
    }

    document.addEventListener('DOMContentLoaded', initialize);
})();
