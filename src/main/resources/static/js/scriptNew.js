document.addEventListener('DOMContentLoaded', () => {
	// =================================================================
    // 🚨 원본 chart-grid HTML 저장 로직 추가
    // =================================================================
    const statCardParent = document.querySelector('.col-12.col-lg-8');
    const chartGrid = statCardParent.querySelector('.chart-grid');
    // **HTML 문자열로 저장**하여 복구 시 사용
    const originalChartGridHTML = chartGrid ? chartGrid.innerHTML : '';
	// =================================================================
	// 🚨 NO_CHART_GRID_HTML: 통계 카드 내부의 차트 그리드(지수, TOP 일기)를 대체할 HTML
	// =================================================================
	const NO_CHART_GRID_HTML = `
	    <div class="d-flex flex-column align-items-center justify-content-center" 
	         style="height: 350px; padding: 20px; text-align: center; background-color: #f7f7f7; border-radius: 8px;">
	        <img src="/img/생각하는도닥이.png" alt="데이터 없음 도닥이" style="width: 150px; margin-bottom: 15px;">
	        <h5 class="fw-bold mb-1" style="color: #6c757d;">선택된 월의 분석 데이터가 없습니다.</h5>
	        <p style="color: #888;">일기를 작성하고 분석 결과를 확인해 보세요.</p>
	    </div>
	`;
	// =================================================================
	// 🚨 수정할 HTML Placeholder 메시지
	// =================================================================
	const NO_DATA_HTML = `
	    <div class="d-flex flex-column align-items-center justify-content-center" 
	         style="height: 300px; color: #888;">
	        <i class="bi bi-bar-chart-fill" style="font-size: 3rem; margin-bottom: 10px;"></i>
	        <h5 class="fw-bold mb-1">데이터가 없어 차트 분석을 할 수 없어요.</h5>
	        <p>해당 월에 작성된 일기가 없습니다.</p>
	    </div>
	`;
	let latestAnalysisData = [];
	// =================================================================
    // =================================================================
	// =================================================================
	// 1. 일기 작성 탭 - 기분 선택 및 통계 미리보기 로직 (변경 없음)
	// =================================================================
	const moodButtons = document.querySelectorAll('.mood-select button');

	const MOOD_MAP = {
		'기쁨': {
			percentage: 100,
			color: 'var(--mood-joy)',
			comment: '**축하해요!** 희망이 많이 보여요!',
			image: '/img/활짝웃는도닥이.png'
		},
		'슬픔': {
			percentage: 85,
			color: 'var(--mood-sad)',
			comment: '오늘은 슬픈 일이 있었군요. 도닥이가 위로해 줄게요.',
			image: '/img/휴식하는도닥이.png'
		},
		'분노': {
			percentage: 90,
			color: 'var(--mood-anger)',
			comment: '마음속의 화를 건강하게 표현하는 방법을 찾아봐요.',
			image: '/img/생각하는도닥이.png'
		},
		'불안': {
			percentage: 70,
			color: 'var(--mood-anxiety)',
			comment: '불안한 마음이 크면 숨쉬기 운동을 해보세요.',
			image: '/img/구름도닥이.png'
		},
		'후회': {
			percentage: 80,
			color: 'var(--mood-regret)',
			comment: '지나간 일에 너무 얽매이지 않기로 해요!',
			image: '/img/앉아서독서하는도닥이.png'
		}
	};

	const updateMoodStats = (selectedMood) => {
		const statsSection = document.getElementById('todayStatsCollapse');
		if (!statsSection) return;

		const analysisResultDiv = statsSection.querySelector('.today-mood-analysis-result');
		const commentP = document.getElementById('attiComment');
		const previewImg = document.getElementById('previewMoodDodak');

		const data = MOOD_MAP[selectedMood] || MOOD_MAP['기쁨'];

		if (commentP) {
			commentP.innerHTML = data.comment;
		}

		if (previewImg) {
			previewImg.src = data.image;
			previewImg.alt = `${selectedMood} 기분 도닥이 이미지`;
		}

		let html = '';
		for (const mood in MOOD_MAP) {
			const isSelected = mood === selectedMood;
			const percentage = isSelected ? 100 : 0;
			const color = MOOD_MAP[mood].color;

			html += `
                <div class="mood-analysis-item">
                    <span>${mood}</span>
                    <div class="mood-bar-container">
                        <div class="mood-bar-fill" style="background-color: ${color};" data-mood-percentage="${percentage}%">${percentage}%</div>
                    </div>
                </div>
            `;
		}
		analysisResultDiv.innerHTML = html;
	};

	moodButtons.forEach(button => {
		button.addEventListener('click', function() {
			moodButtons.forEach(btn => btn.classList.remove('selected'));
			this.classList.add('selected');
			const selectedMood = this.dataset.mood;
			updateMoodStats(selectedMood);
		});
	});

	updateMoodStats('기쁨');

	const todayStatsCollapse = document.getElementById('todayStatsCollapse');
	if (todayStatsCollapse) {

		todayStatsCollapse.addEventListener('shown.bs.collapse', function() {
			const moodBars = document.querySelectorAll('#todayStatsCollapse .mood-bar-fill');
			moodBars.forEach(bar => {
				const percentage = bar.dataset.moodPercentage;
				bar.style.width = '0%';
				bar.offsetHeight;
				bar.style.width = percentage;
			});
		});

		todayStatsCollapse.addEventListener('hidden.bs.collapse', function() {
			const moodBars = document.querySelectorAll('#todayStatsCollapse .mood-bar-fill');
			moodBars.forEach(bar => {
				bar.style.width = '0%';
			});
		});
	}

	const saveDiaryBtn = document.getElementById('saveDiaryBtn');
	if (saveDiaryBtn) {
		saveDiaryBtn.addEventListener('click', function() {
			const selectedMood = document.querySelector('.mood-select button.selected')?.dataset.mood || '미선택';
			const title = document.getElementById('diaryTitle').value;
			const content = document.getElementById('diaryContent').value;

			//alert(`[일기 저장 요청]\n선택된 기분: ${selectedMood}\n제목: ${title}\n내용: ${content.substring(0, 50)}...\n\n(실제 저장 로직은 서버에서 처리됩니다.)`);

			document.getElementById('diaryTitle').value = '';
			document.getElementById('diaryContent').value = '';
			moodButtons.forEach(btn => btn.classList.remove('selected'));
			document.querySelector('.mood-select button[data-mood="기쁨"]').classList.add('selected');
			updateMoodStats('기쁨');
		});
	}

	const date = new Date();
	const todayYear = date.getFullYear()
	const todayMonth = date.getMonth() + 1;  // 월
	const todayDay = date.getDate();  // 일
	
	const currentMonthDisplay = document.getElementById('currentMonthDisplay');
	const prevMonthBtn = document.querySelector('.month-prev-btn');
	const nextMonthBtn = document.querySelector('.month-next-btn');
	const yearSelect = document.getElementById('yearSelect');
	const calendarGrid = document.querySelector('.calendar-grid');
	// =================================================================
	// 2. 이달의 마음통계 탭 - 달력 월 이동 기능 및 UI 업데이트 로직
	// =================================================================
	// 탭이 처음 활성화될 때 (show.bs.tab) 목록 로드
	$('#stats-tab').on('shown.bs.tab', function (e) {
		// **jQuery 사용으로 통일**
        const $yearSelect = $(yearSelect); // yearSelect를 jQuery 객체로 래핑

        $yearSelect.empty(); // ⬅️ 수정 완료: jQuery 객체에 .empty() 호출
        
        // 현재 연도부터 1년 전까지의 연도 옵션을 추가
        for (let year = todayYear; year >= todayYear - 1; year--) {
            // alert(year); // 디버깅용 alert는 제거했습니다.
            const isSelected = (year === todayYear) ? 'selected' : '';
            const optionHtml = `<option value="${year}" ${isSelected}>${year}년</option>`;
            $yearSelect.append(optionHtml);
        }

        // 🚨 수정: currentMonthDisplay 또한 jQuery 메서드를 사용하려면 래핑해야 합니다.
        const $currentMonthDisplay = $(currentMonthDisplay);

        // --- 3. 현재 월 설정 (Current Month Display) ---
        
        // currentMonthDisplay의 텍스트와 data 속성을 오늘의 달로 설정
        $currentMonthDisplay.text(`${todayMonth}월`); // ⬅️ 수정 완료: jQuery 객체에 .text() 호출
        $currentMonthDisplay.attr('data-initial-month', todayMonth); // ⬅️ 수정 완료: jQuery 객체에 .attr() 호출
        
        yearSelect.value = todayYear; // ⬅️ 이 부분은 순수 JS의 .value를 사용해도 무방         	
	});
	
	let currentYear = parseInt(yearSelect.value, 10);
	let currentMonth = parseInt(currentMonthDisplay.dataset.initialMonth, 10);

	const MOCK_MOOD_DATA_MAY = {		
	};
	
	


	function renderCalendar(year, month) {		
		currentMonthDisplay.textContent = `${month}월`;
		yearSelect.value = year;

		const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
		const daysInMonth = new Date(year, month, 0).getDate();
		const todayDate = new Date();
		const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() + 1 === month;

		let datesHtml = `
            <div class="calendar-header">월</div><div class="calendar-header">화</div><div class="calendar-header">수</div><div class="calendar-header">목</div><div class="calendar-header">금</div><div class="calendar-header">토</div><div class="calendar-header">일</div>
        `;

		let weekStartOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
		for (let i = 0; i < weekStartOffset; i++) {
			datesHtml += `<div></div>`;
		}

		for (let day = 1; day <= daysInMonth; day++) {
			let moodStyle = '';
			let className = 'calendar-day date';
			const isToday = isCurrentMonth && day === todayDate.getDate();

			if (isToday) {
				className = 'calendar-day today';
			}

			//if (year === 2025 && month === 5) {
			if (MOCK_MOOD_DATA_MAY[day]) {
				moodStyle = `style="background-color: ${MOCK_MOOD_DATA_MAY[day]}; color: white;"`;
				className = 'calendar-day';
				if (isToday) className = 'calendar-day today';
			}
			/*} else {
				moodStyle = '';
				className = isToday ? 'calendar-day today' : 'calendar-day date';
			}*/

			datesHtml += `<div class="${className}" ${moodStyle}>${day}</div>`;
		}
		
		calendarGrid.innerHTML = datesHtml;
		// ... (달력 날짜 생성 로직 끝) ...

		// =======================================================
		// 1. 월별 제목 업데이트 (통계 탭 제목과 일기 탭 제목 동시 업데이트)
		// =======================================================
		// 🚨 선택자 수정: #stats-tab-pane -> #stats-panel
		const statsHeader = document.querySelector('#stats-panel .stats-header');
		const diaryMonthTitle = document.getElementById('diaryMonthTitle');

		if (diaryMonthTitle) {
			diaryMonthTitle.textContent = `${month}월의 마음 기록`;
		}

		// =======================================================
		// 2. 통계 내용 및 일기 목록 표시/숨김 처리 (문제 해결 로직)
		// =======================================================
		const statsContent = document.querySelector('.row.gx-4');
		const diaryListContainer = document.querySelector('.diary-list-container');

		//if (year === 2025 && month === 5) {
		// --- [2025년 5월: 데이터가 있을 때] ---

		// 제목 업데이트: 현재 월로 표시
		if (statsHeader) {
			statsHeader.innerHTML = `${month}월의 마음 속 이야기
                    <img src="/img/문서보는도닥이.png" alt="통계 도닥이" class="dodak-local-element dodak-stats-title-1">`;
		}

		// 통계 내용 및 일기 목록 표시
		if (statsContent) statsContent.style.display = 'flex';
		if (diaryListContainer) diaryListContainer.style.display = 'block';
		bindCalendarEvents();
		bindDiaryDetailEvents();
	}
	
	function getOneYearAgoMonth(inputYear, inputMonth) {
	    // JavaScript Date 객체의 월은 0부터 시작하므로 입력 월에서 1을 뺍니다.
	    const date = new Date(inputYear, inputMonth - 1, 1);	    
	    // 1년 전 연도를 계산합니다.
	    const oneYearAgoYear = date.getFullYear() - 1;
	    const oneYearAgoMonth = date.getMonth() + 1; // 다시 실제 월 숫자로 변환

	    return {
	        year: oneYearAgoYear,
	        month: oneYearAgoMonth
	    };
	}
	// 년도 드롭다운 변경 이벤트
	yearSelect.addEventListener('change', (e) => {
		currentYear = parseInt(e.target.value, 10);
		renderCalendar(currentYear, currentMonth);
	});

	// 페이지 로드 시 초기 달력 렌더링
	renderCalendar(currentYear, currentMonth);
	
	// (탭 클릭 시 초기 달력 상태로 복구 및 강제 업데이트 로직)
	const statsTab = document.getElementById('stats-tab');
	const diaryTab = document.getElementById('list-tab'); // ID 변경: list-tab

	// 통계 탭을 클릭했을 때의 로직 (5월 초기화)
	if (statsTab) {
		statsTab.addEventListener('click', () => {
			const todayDate = new Date();
			currentYear = todayDate.getFullYear();
			currentMonth = todayDate.getMonth() + 1;
			renderCalendar(currentYear, currentMonth);
		});
	}

	// 일기장 탭을 클릭했을 때의 로직 (현재 상태로 강제 업데이트)
	if (diaryTab) {
		diaryTab.addEventListener('click', () => {
			renderCalendar(currentYear, currentMonth);
		});
	}
	
	
	
	const $currentMonthDisplay = $('#currentMonthDisplay');		
		const $yearSelect = $(yearSelect); // jQuery 래핑		
		const patientSelect = document.getElementById('patientSelect'); // 환자 선택 추가
	    
		// Chart.js 인스턴스를 저장할 전역 변수
		let lineChartInstance = null;
		let pieChartInstance = null;

		// =================================================================
		// 2. 이달의 마음통계 탭 - 달력 월 이동 기능 및 UI 업데이트 로직
		// =================================================================
	    // 탭 활성화 시 초기 설정
		$('#stats-tab').on('shown.bs.tab', function (e) {
			
	        // 1. 연도 Select 초기화 및 설정 (1년 전부터 현재 연도까지)
	        $yearSelect.empty();
	        for (let year = todayYear; year >= todayYear - 1; year--) {
	            const isSelected = (year === todayYear) ? 'selected' : '';
	            const optionHtml = `<option value="${year}" ${isSelected}>${year}년</option>`;
	            $yearSelect.append(optionHtml);
	        }

	        // 2. 월 Display 초기화 및 설정 (오늘의 달)
	        $currentMonthDisplay.text(`${todayMonth}월`);
	        $currentMonthDisplay.attr('data-initial-month', todayMonth);
	        yearSelect.value = todayYear;
	        // 4. 초기 상태 설정 후 캘린더/차트 렌더링
	        currentYear = todayYear;
	        currentMonth = todayMonth;
	        // 초기 렌더링은 환자 선택 후 트리거되도록 합니다.
		});
		$('#stats-tab').on('shown.bs.tab', function (e) {
			let currentYear = todayYear;
			let currentMonth = todayMonth;
		    let currentMemberId = null; // 현재 선택된 환자의 PK
			

			// --- 캘린더 렌더링 로직 (기존 함수 재활용) ---
			function renderCalendar(year, month, analysisData = []) {
				
		        // 1. 연월 업데이트
				$currentMonthDisplay.text(`${month}월`);
				yearSelect.value = year;
		        
		        // 2. 달력 날짜 생성
				const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0(일) ~ 6(토)
				const daysInMonth = new Date(year, month, 0).getDate();
				const todayDate = new Date();
				const isCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() + 1 === month;

				let datesHtml = `
		            <div class="calendar-header">월</div><div class="calendar-header">화</div><div class="calendar-header">수</div><div class="calendar-header">목</div><div class="calendar-header">금</div><div class="calendar-header">토</div><div class="calendar-header">일</div>
		        `;
		        
				

		        // 분석 데이터를 Day를 키로 하는 Map으로 변환
		        const moodMap = new Map();
		        // Analysis 엔티티의 Joy Ratio를 기반으로 달력 색상 결정
		        const getMoodColor = (data) => {
		            // Joy > 70 -> 기쁨 (var(--mood-joy))
		            if (data.joyRatio > 40.0) return '#a5d6a7'; 
		            // Sadness/Depression/Anxiety 합이 높을 때
		            if (data.sadnessRatio + data.depressionRatio + data.anxietyRatio > 50.0) return '#90caf9'; 
		            // Anger/Regret 높을 때
		            if (data.angerRatio > 30.0 || data.regretRatio > 30.0) return '#ffb7b2';
		            // Neutrality/Tiredness
		            return '#bdbdbd';
		        };
		        
		        analysisData.forEach(data => {
					let isoString = data.createdAt;
					// 1. 'T'를 기준으로 분리하여 날짜 부분("2025-11-12")을 가져옴
					const fullDate = isoString.split('T')[0];

					// 2. 하이픈('-')을 기준으로 분리: ["2025", "11", "12"]
					const parts = fullDate.split('-');

					// 3. 마지막 요소(인덱스 2)인 '일'을 가져옴
					const day = parts[2];
					console.log(day);
		            moodMap.set(parseInt(day, 10), { 
		                color: getMoodColor(data),
		                data: data // 전체 데이터 저장
		            });
		        });

				let weekStartOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 월요일(1)부터 시작하도록 보정
				for (let i = 0; i < weekStartOffset; i++) {
					datesHtml += `<div></div>`;
				}

				for (let day = 1; day <= daysInMonth; day++) {
					let moodStyle = '';
					let className = 'calendar-day date';
					const isToday = isCurrentMonth && day === todayDate.getDate();
		            const dayData = moodMap.get(day);

					if (isToday) {
						className = 'calendar-day today';
					}
					
		            if (dayData) {
						moodStyle = `style="background-color: ${dayData.color}; color: white; cursor: pointer;"`;
						className = 'calendar-day has-data';						
						if (isToday) className = 'calendar-day today has-data';
						datesHtml += `<div class="${className}" data-day="${day}" data-diary-idx="${dayData.data.diaryIdx}" data-date="${dayData.data.createdAt}" ${moodStyle}>${day}</div>`;
					} else {
		                moodStyle = '';
		                className = isToday ? 'calendar-day today' : 'calendar-day date';
						datesHtml += `<div class="${className}" data-day="${day}" ${moodStyle}>${day}</div>`;
		            }
					
																			                        
					
				}

				calendarGrid.innerHTML = datesHtml;
				
		        // 3. 차트 표시/숨김 및 제목 업데이트
				const statsHeader = document.querySelector('#stats-panel .stats-header');
				const statsContent = document.querySelector('.row.gx-4');
				const diaryListContainer = document.querySelector('.diary-list-container');

		        // 데이터 존재 여부에 따른 UI 처리
				if (analysisData.length > 0) {
					// 데이터가 있을 때: 통계 표시
					if (statsHeader) {
						statsHeader.innerHTML = `${month}월의 마음 속 이야기
		                    <img src="/img/문서보는도닥이.png" alt="통계 도닥이" class="dodak-local-element dodak-stats-title-1">`;
					}
					if (statsContent) statsContent.style.display = 'flex';
					if (diaryListContainer) diaryListContainer.style.display = 'block';
				} else {
					// 데이터가 없을 때: 준비 중 메시지 표시
					if (statsHeader) {
						statsHeader.innerHTML = `
							<div class="text-center" style="width: 100%;">
								<img src="/img/생각하는도닥이.png" alt="준비 중 도닥이 상단" style="width: 350px; margin-bottom: 15px;">
								<h5 class="fw-bold mb-3" style="color: #0088ffff;">
									${year}년 ${month}월의 통계는 아직 준비 중이에요!
								</h5>
								<img src="/img/휴식하는도닥이.png" alt="준비 중 도닥이 하단" style="width: 350px; margin-top: 15px;">
							</div>
						`;
					}
					if (statsContent) statsContent.style.display = 'none'; 
					if (diaryListContainer) diaryListContainer.style.display = 'none'; 
				}
				bindCalendarEvents();
				bindDiaryDetailEvents();
			}

			
			
						
		    // --- 핵심: 데이터 가져오기 및 렌더링 관리 함수 ---
		    async function fetchAndRenderCharts(memberId, year, month) {
				
				
				// 통계 카드 부모 요소 (우측 상단 col-12 col-lg-8)
			    const statCardParent = document.querySelector('.col-12.col-lg-8');
			    const chartGrid = statCardParent.querySelector('.chart-grid');
				
				// 🚨 중요: 데이터가 있을 때 복구할 원본 .chart-grid HTML을 미리 저장해야 합니다.
			    // DOMContentLoaded 시점에 원본 HTML을 저장하는 로직이 필요합니다.
			    // 데이터가 있을 때 복구할 원래 HTML (임시로 저장, 실제로는 DOM을 복제하여 저장해야 하지만 단순화를 위해 ID 부여)
			    // 🚨 중요: HTML 원본 구조가 필요합니다. 만약 HTML이 서버에서 로드되지 않고 고정되어 있다면, 
			    // 로드 시점에 원본을 미리 저장해야 합니다. 여기서는 동적으로 원본을 로드한다고 가정하고 로직만 구현합니다.
			    const originalStatCardHTML = statCardParent.querySelector('.app-card').outerHTML; // 원본 HTML을 복사했다고 가정
				
				if (!memberId) {
					// 환자가 선택되지 않았을 때의 초기 처리 (차트 영역 처리 및 통계 카드 숨김)
			        renderCalendar(year, month, []);
			        renderCharts([]);
					elementShow('.row.gx-4');
					
			        return;
			    }
				
				
				
		        
		        // 🚨 실제 API 호출 부분 (Mock Service 호출)
		        // 실제 환경에서는 백엔드 API 엔드포인트로 fetch 요청을 보내야 합니다.
		        // 예: const response = await fetch(`/api/analysis/monthly?memberId=${memberId}&year=${year}&month=${month}`);
		        // Mock 데이터로 대체합니다.
		        console.log(`[DATA FETCH] 환자 ID: ${memberId}, 연월: ${year}-${month} 데이터 요청...`);
				try {
				        const url = `/api/analyses/monthly?memberId=${memberId}&year=${year}&month=${month}`;
				        const response = await fetch(url, { method: 'GET' });

				        if (response.ok) {
				            const analysisData = await response.json();
				            
				            // 1. 달력 렌더링
				            renderCalendar(year, month, analysisData);
							latestAnalysisData = analysisData;
				            if (analysisData.length > 0) {
				                // --- 데이터가 있을 때 ---
				                
				                // 2. 우측 상단 통계 카드 내용 (chart-grid) 복구 및 데이터 바인딩
				                chartGrid.innerHTML = originalChartGridHTML; // 원본 HTML 복구 (🚨 실제 데이터 바인딩 로직은 별도 구현 필요)

				                // 3. 차트 렌더링
				                renderCharts(analysisData);
								
								// 1. 종합 통계 및 TOP 3 일기 데이터 계산
								const statsData = calculateMonthlyStatsAndTopDays(analysisData);
								console.log(JSON.stringify(statsData));
								// chartGrid는 우측 상단 통계 카드 내부의 .chart-grid 요소라고 가정합니다.
								if (statsData && chartGrid) {
								    const { monthlyStats, top3Days } = statsData;

								    // =============================================================
								    // 1. 월별 감정 지수 (프로그레스 바) 업데이트
								    // =============================================================

									// 1. 통계 카드의 부모 요소 (첫 번째 .p-3)를 명확히 지정합니다.
									const statCardContent = chartGrid.querySelector('.p-3:first-child'); 
									// OR: const statCardContent = chartGrid.children[0];

									if (statCardContent) {
									    // 종합 우울지수 업데이트
									    // 우울 지수 바는 첫 번째 p-3 내부의 3번째 자식입니다.
									    const sadnessBar = statCardContent.querySelector('.indicator-bar:nth-child(3)');
									    
									    if (sadnessBar) {
									        sadnessBar.querySelector('.indicator-fill').style.width = `${monthlyStats.sadness.percentage}%`;
									        
									        // 지수 레벨 텍스트 업데이트 (indicator-bar 이전의 <p> 태그의 span)
									        // sadnessBar.previousElementSibling은 두 번째 <p> (종합 우울지수)입니다.
									        sadnessBar.previousElementSibling.querySelector('span').innerHTML = `${monthlyStats.sadness.level}`;
									    }

									    // 종합 행복지수 업데이트
									    // 행복 지수 바는 첫 번째 p-3 내부의 5번째 자식입니다.
									    const happinessBar = statCardContent.querySelector('.indicator-bar:nth-child(5)');
									    
									    if (happinessBar) {
									        happinessBar.querySelector('.indicator-fill').style.width = `${monthlyStats.happiness.percentage}%`;
									        
									        // 지수 레벨 텍스트 업데이트 (indicator-bar 이전의 <p> 태그의 span)
									        // happinessBar.previousElementSibling은 네 번째 <p> (종합 행복지수)입니다.
									        happinessBar.previousElementSibling.querySelector('span').innerHTML = `${monthlyStats.happiness.level}`;
									    }
									} else {
									    console.error("통계 카드 콘텐츠 (.p-3:first-child)를 찾을 수 없습니다.");
									}


								    // =============================================================
								    // 2. TOP 3 일기 목록 업데이트
								    // =============================================================
								    
								    // TOP 3 일기 목록을 담는 부모 요소 (예: .top-diary-list-container)
								    const top3ListContainer = chartGrid.querySelector('.top-diary-list-container');
									// [주의] top3Days 배열의 각 객체에 'diaryId' 필드가 있다고 가정합니다.
									
									if (top3ListContainer) {
									    let listHtml = '';
										
									    if (top3Days.length > 0) {
									        top3Days.forEach((day, index) => {
												const diaryDate = new Date(day.createdAt).toLocaleDateString('ko-KR', {
												                year: 'numeric', month: '2-digit', day: '2-digit', weekday: "long" , hour: "2-digit" , minute: "2-digit" 
												            }).replace(/\. /g, '.').replace(/\.$/, '');	
																						            
									            const displayDate =diaryDate; 
									            const title = day.diaryTitle || '제목 없음';
												
												
									            listHtml += `
									                <button class="top-diary-btn" 
									                        data-diary-idx="${day.diaryIdx}" 
									                        data-date="${day.createdAt}">
									                    TOP ${index + 1} 일기: ${title} (${displayDate})
									                </button>
									            `;
												console.log("listHtml : " + listHtml);
									        });
									    } // ... (else 로직 유지) ...

									    top3ListContainer.innerHTML = listHtml;
										
									    
									    // 🚨 목록 업데이트 후, 이벤트 리스너를 다시 바인딩합니다.
									    bindDiaryDetailEvents();
									}
								}
				                
				            } else {
				                
								initializeAnalysisUI(year, month);
				            }
				        } 
				        // ... (오류 처리 시에도 빈 데이터로 처리) ...
				    } catch (error) {
				        // ... (에러 발생 시 처리) ...				        
						initializeAnalysisUI(year, month);						
					}				
		    }

			// 이전 달 버튼 클릭 이벤트
			prevMonthBtn.addEventListener('click', () => {				
		        if (!currentMemberId) {
		            alert('환자를 먼저 선택해주세요.');
		            return;
		        }
		        
				currentMonth--;
				if (currentMonth < 1) {
					currentMonth = 12;
					currentYear--;
				}
				const today = new Date();
								// 비교를 위해 오늘 날짜의 시, 분, 초, 밀리초를 0으로 설정하여 '일' 기준까지만 비교
				today.setHours(0, 0, 0, 0); 
				const year = today.getFullYear();
				const month = today.getMonth() + 1;  // 월
				
				const oneYearAgo = getOneYearAgoMonth(year, month);

				

				// 비교 로직 (예시)
				const date1 = new Date(currentYear, currentMonth - 1, 1);
				const date2 = new Date(oneYearAgo.year, oneYearAgo.month - 1, 1);		
				
				const sYear = date1.getFullYear();
				const sMonth = String(date1.getMonth()+1).padStart(2, '0');
				const sToday = `${sYear}-${sMonth}`;
				const sYear2 = date2.getFullYear();
				const sMonth2 = String(date2.getMonth()+1).padStart(2, '0');
				const sToday2 = `${sYear2}-${sMonth2}`;
				 
				if (sToday === sToday2) {			
				    renderCalendar(currentYear, currentMonth);
				} else if (sToday < sToday2) {
					alert('1년 이전의 데이터는 조회할 수 없습니다.');
					currentMonth++;
					if (currentMonth > 12) {
						currentMonth = 1;
						currentYear++;
					}			
					yearSelect.value = currentYear;
				} else {
				    renderCalendar(currentYear, currentMonth);
				}
		        
		        
		        fetchAndRenderCharts(currentMemberId, currentYear, currentMonth);
			});

			// 다음 달 버튼 클릭 이벤트
			nextMonthBtn.addEventListener('click', () => {				
		        if (!currentMemberId) {
		            alert('환자를 먼저 선택해주세요.');
		            return;
		        }
				
				currentMonth++;
				if (currentMonth > 12) {
					currentMonth = 1;
					currentYear++;
				}
				const diffDate = new Date(currentYear, currentMonth-1)
				const today = new Date();
				// 비교를 위해 오늘 날짜의 시, 분, 초, 밀리초를 0으로 설정하여 '일' 기준까지만 비교
				today.setHours(0, 0, 0, 0);
				diffDate.setHours(0, 0, 0, 0);  
				
				const sYear = diffDate.getFullYear();
				const sMonth = String(diffDate.getMonth()+1).padStart(2, '0');
				const sToday = `${sYear}-${sMonth}`;
				const sYear2 = today.getFullYear();
				const sMonth2 = String(today.getMonth()+1).padStart(2, '0');
				const sToday2 = `${sYear2}-${sMonth2}`;
				// 비교
				if (sToday === sToday2) {
					renderCalendar(currentYear, currentMonth);
				} else if (sToday < sToday2) {
					renderCalendar(currentYear, currentMonth);
				} else {
					alert('미래의 데이터는 조회할 수 없습니다.');
					currentMonth--;
					if (currentMonth < 1) {
						currentMonth = 12;
						currentYear--;
					}			
					yearSelect.value = currentYear;			
				}

		        fetchAndRenderCharts(currentMemberId, currentYear, currentMonth);
			});
		    
			// 년도 드롭다운 변경 이벤트
			yearSelect.addEventListener('change', (e) => {
		        if (!currentMemberId) {
		            alert('환자를 먼저 선택해주세요.');
		            // 변경된 연도를 다시 이전 연도로 되돌림
		            e.target.value = currentYear; 
		            return;
		        }
		        
				currentYear = parseInt(e.target.value, 10);
		        fetchAndRenderCharts(currentMemberId, currentYear, currentMonth);
			});
		    
		    // 환자 선택 드롭다운 변경 이벤트
		    patientSelect.addEventListener('change', (e) => {
		        // 환자 선택 시 항상 현재 연월로 초기화하고 데이터를 다시 가져옴
		        currentYear = todayYear;
		        currentMonth = todayMonth;
				
				currentMemberId = parseInt(e.target.value, 10);
				if (!currentMemberId) {		            
					initializeAnalysisUI(currentYear, currentMonth);		             
		            return;
		        }
		        
		        // 연도 드롭다운 및 월 표시 업데이트 (UI)
		        yearSelect.value = currentYear;
		        $currentMonthDisplay.text(`${currentMonth}월`);
		        
		        fetchAndRenderCharts(currentMemberId, currentYear, currentMonth);
		    });

			// 페이지 로드 시 초기 렌더링은 stats-tab의 'shown.bs.tab' 이벤트에서 처리됩니다.
			
			initializeAnalysisUI(currentYear, currentMonth);			
		});
		
		function elementShow(elementName){
			const elements = document.querySelectorAll(elementName);

			// forEach를 사용하여 각 요소에 스타일을 적용합니다.
			elements.forEach(function(element) {
			  element.style.display = 'flex';
			});
		}
		
		// =================================================================
		// 🚨 추가: 탭 전환 시 차트 갱신 로직
		// =================================================================

		// 탭 버튼 요소를 가져옵니다.
		const pieTab = document.getElementById('pie-tab');
		const lineTab = document.getElementById('line-tab');

		// 탭 내용 요소 (Bootstrap 탭 컨트롤 대상)
		const pieChartPane = document.getElementById('pie-chart-pane');
		const lineChartPane = document.getElementById('line-chart-pane');


		// 탭 전환 이벤트 리스너 (jQuery를 사용하여 Bootstrap 이벤트 활용)
		$('#pie-tab, #line-tab').on('shown.bs.tab', function (e) {
		    // e.target은 클릭된 탭 버튼(#pie-tab 또는 #line-tab)
		    // 탭 콘텐츠의 ID를 가져오려면 버튼의 'data-bs-target' 속성을 사용해야 합니다.
		    const targetPaneId = $(e.target).data('bs-target'); // 예: '#pie-chart-pane'
		    
		    // '#'을 제거하고 ID 문자열만 가져옵니다.
		    const activePaneId = targetPaneId ? targetPaneId.substring(1) : null; 

		    // alert("탭 콘텐츠 ID 확인: " + activePaneId); // 디버깅용

		    // 🚨 중요: latestAnalysisData 변수가 이 클로저에서 접근 가능해야 합니다.
		    console.log("latestAnalysisData.length : " + latestAnalysisData.length );
		    
		    if (latestAnalysisData.length === 0) {
		        return; 
		    }
		    
		    // 차트 재생성
		    if (activePaneId === 'pie-chart-pane') {
		        // Line 차트 인스턴스 파괴 및 Pie 차트 재생성
		        destroyLineChart();
		        // 캔버스 재생성: 탭 콘텐츠 영역의 innerHTML을 덮어씌웁니다.
		        document.getElementById('pie-chart-pane').innerHTML = '<canvas id="pie-chart" width="342px" height="342px"></canvas>';
		        const pieData = createPieChartData(latestAnalysisData);
		        pieChartDraw(pieData);
		        
		    } else if (activePaneId === 'line-chart-pane') {
		        // Pie 차트 인스턴스 파괴 및 Line 차트 재생성
		        destroyPieChart();
		        // 캔버스 재생성
		        document.getElementById('line-chart-pane').innerHTML = '<canvas id="line-chart" width="342px" height="342px"></canvas>';
		        const lineData = createLineChartData(latestAnalysisData);
		        lineChartDraw(lineData);
		    }
		});
		// =================================================================


		// 🚨 기존 destroyCharts 함수를 개별 함수로 분리합니다.
		function destroyLineChart() {
		    if (lineChartInstance) {
		        lineChartInstance.destroy();
		        lineChartInstance = null;
		    }
		}

		function destroyPieChart() {
		    if (pieChartInstance) {
		        pieChartInstance.destroy();
		        pieChartInstance = null;
		    }
		}

		// 기존 renderCharts 함수도 갱신 필요 (탭 전환 시 캔버스 재생성)
		function renderCharts(analysisData) {
		    const piePane = document.getElementById('pie-chart-pane');
		    const linePane = document.getElementById('line-chart-pane');
		    
		    // 이 시점에서는 모든 차트 인스턴스를 파괴합니다.
		    destroyLineChart();
		    destroyPieChart(); 

		    if (analysisData.length > 0) {
		        // --- 데이터가 있을 때 ---
		        // 캔버스 요소를 다시 삽입합니다. (탭 내용이 덮어씌워질 수 있으므로 안전하게)
		        piePane.innerHTML = '<canvas id="pie-chart" width="342px" height="342px"></canvas>';
		        linePane.innerHTML = '<canvas id="line-chart" width="342px" height="342px"></canvas>';

		        // 활성화된 탭의 차트만 실제로 그립니다.
		        if (piePane.classList.contains('active')) {
		             const pieData = createPieChartData(analysisData);
		             pieChartDraw(pieData);
		        } else if (linePane.classList.contains('active')) {
		             const lineData = createLineChartData(analysisData);
		             lineChartDraw(lineData);
		        }
		        
		    } else {
		        // --- 데이터가 없을 때 ---
		        // 캔버스 대신 '데이터 없음' 메시지를 삽입합니다.
		        piePane.innerHTML = NO_DATA_HTML;
		        linePane.innerHTML = NO_DATA_HTML;
		    }
		}
		
		function createLineChartData(analysisData) {				
			const dates = analysisData.map(d => {
			    // 1. T를 기준으로 날짜(YYYY-MM-DD) 추출
			    const fullDate = d.createdAt.split('T')[0]; 
			    
			    // 2. 하이픈(-)을 기준으로 분리하여 일자 문자열 추출
			    const dayString = fullDate.split('-')[2]; 
			    
			    // 3. 정수로 변환하여 반환
			    return parseInt(dayString, 10);
			});
	        const happinessData = analysisData.map(d => 
	            Math.round((d.hopeRatio + d.neutralityRatio + d.joyRatio) * 10) / 10
	        );
	        const sadnessData = analysisData.map(d => 
	            Math.round((d.anxietyRatio + d.regretRatio + d.tirednessRatio + d.depressionRatio + d.sadnessRatio + d.angerRatio) * 10) / 10
	        );

			
			
			return {
				labels: dates,
				datasets: [{
					data: happinessData,
					label: "행복 지수",
					borderColor: "#a5d6a7", // 기쁨 색상
					backgroundColor: "rgba(255, 205, 86, 0.2)",
					fill: true,
	                tension: 0.3
				}, {
					data: sadnessData,
					label: "우울 지수",
					borderColor: "#90caf9", // 슬픔 색상
					backgroundColor: "rgba(54, 162, 235, 0.2)",
					fill: true,
	                tension: 0.3
				}]
			};
		}

		function createPieChartData(analysisData) {
	        if (analysisData.length === 0) return null;
	        
	        // 월별 감정 비율의 평균을 계산
	        const avgRatios = {
	            joy: 0, sadness: 0, anger: 0, anxiety: 0, regret: 0, 
	            hope: 0, neutrality: 0, tiredness: 0, depression: 0
	        };

	        analysisData.forEach(d => {
	            avgRatios.joy += d.joyRatio;
	            avgRatios.sadness += d.sadnessRatio;
	            avgRatios.anger += d.angerRatio;
	            avgRatios.anxiety += d.anxietyRatio;
	            avgRatios.regret += d.regretRatio;
	            avgRatios.hope += d.hopeRatio;
	            avgRatios.neutrality += d.neutralityRatio;
	            avgRatios.tiredness += d.tirednessRatio;
	            avgRatios.depression += d.depressionRatio;
	        });
	        
	        const count = analysisData.length;
	        const finalRatios = {
	            '기쁨': Math.round(avgRatios.joy / count),
	            '슬픔': Math.round(avgRatios.sadness / count),
	            '분노': Math.round(avgRatios.anger / count),
	            '불안': Math.round(avgRatios.anxiety / count),
	            '후회': Math.round(avgRatios.regret / count),
	            '희망': Math.round(avgRatios.hope / count),
	            '중립': Math.round(avgRatios.neutrality / count),
	            '피로': Math.round(avgRatios.tiredness / count),
	            '우울': Math.round(avgRatios.depression / count),
	        };
	        
	        const labels = Object.keys(finalRatios);
	        const data = Object.values(finalRatios);
	        
			
			
			return {
				labels: labels,
				datasets: [{
					data: data,
					backgroundColor: [
	                    '#a5d6a7',      // 기쁨 (노랑/밝은색)
	                    '#90caf9',      // 슬픔 (파랑)
	                    '#ffb7b2',    // 분노 (빨강)
	                    '#ffcc99',  // 불안 (주황)
	                    '#c9a0dc',   // 후회 (청록)
	                    '#4CAF50',              // 희망 (초록)
	                    '#bdbdbd',  // 중립 (회색)
	                    '#b0bec5',              // 피로 (보라)
	                    '#7986cb'               // 우울 (짙은 파랑)
	                ]
				}]
			};
		}


	    function lineChartDraw(data) {
	        destroyPieChart // 기존 차트 파괴
	        if (data.labels.length === 0) return; // 데이터 없으면 그리지 않음
	        
	        const ctx = document.getElementById("line-chart").getContext('2d');
	        lineChartInstance = new Chart(ctx, {
	            type: 'line',
	            data: data,
	            options: {
	                responsive: true,
	                maintainAspectRatio: false,
	                plugins: {
	                    legend: {
	                        position: 'top',
	                    },
	                    title: {
	                        display: true,
	                        text: '행복/우울 지수 변화',
	                        font: { size: 14, weight: 'bold' }
	                    }
	                },
	                scales: {
	                    y: {
	                        min: 0,
	                        max: 100,
	                        title: {
	                            display: true,
	                            text: '비율 (%)'
	                        }
	                    },
	                    x: {
	                        title: {
	                            display: true,
	                            text: '일'
	                        }
	                    }
	                }
	            }
	        });
	    }

	    function pieChartDraw(data) {
			destroyLineChart();
	        if (data.labels.length === 0) return; // 데이터 없으면 그리지 않음
	        
	        const ctx = document.getElementById('pie-chart').getContext('2d');

	        pieChartInstance = new Chart(ctx, {
	            type: 'pie',
	            data: data,
	            options: {
	                responsive: true,
	                maintainAspectRatio: false,
	                plugins: {
	                    legend: {
	                        position: 'right',
	                    },
	                    title: {
	                        display: true,
	                        text: '월별 감정 비율',
	                        font: { size: 14, weight: 'bold' }
	                    }
	                }
	            }
	        });
	    }
	
		/**
		 * 해당 월의 종합 감정 지수와 우울 지수 TOP 3 일기를 계산합니다.
		 * @param {Array<Object>} analysisData - 해당 월의 일기 분석 데이터 배열 (date, diaryTitle, variousRatios 포함 가정)
		 * @returns {Object|null} 종합 통계 및 TOP 3 일기 정보, 또는 데이터가 없을 경우 null
		 */
		function calculateMonthlyStatsAndTopDays(analysisData) {
		    if (analysisData.length === 0) {
		        return null; // 데이터가 없을 경우 null 반환
		    }

		    let totalHappinessRatio = 0;
		    let totalSadnessRatio = 0;
		    const dailySadnessData = []; // 날짜별 우울 지수를 저장할 배열

		    // 1. 데이터 순회 및 일별/월별 합계 계산
		    analysisData.forEach(d => {
		        // 일별 행복 지수 합계
		        const dailyHappiness = d.hopeRatio + d.neutralityRatio + d.joyRatio;
		        totalHappinessRatio += dailyHappiness;

		        // 일별 우울 지수 합계 (TOP 3 추출에 사용)
		        const dailySadness = (
		            d.anxietyRatio +
		            d.regretRatio +
		            d.tirednessRatio +
		            d.depressionRatio +
		            d.sadnessRatio +
		            d.angerRatio
		        );
		        totalSadnessRatio += dailySadness;

		        // TOP 3 계산을 위해 일별 데이터 저장 (날짜와 제목 필드가 있다고 가정)
		        dailySadnessData.push({
		            createdAt: d.createdAt, // 예: '2025-11-05'
		            diaryTitle: d.diaryTitle, // 일기 제목
					diaryIdx : d.diaryIdx,
					
		            sadnessScore: Math.round(dailySadness * 10) / 10 // 소수점 한 자리까지 반올림
		        });
		    });

		    const count = analysisData.length;

		    // 2. 월 평균 비율 계산
		    const avgHappinessRatio = totalHappinessRatio / count;
		    const avgSadnessRatio = totalSadnessRatio / count;

		    // 3. TOP 3 일기 추출
		    const top3SaddestDays = dailySadnessData
		        .sort((a, b) => b.sadnessScore - a.sadnessScore) // 우울 지수가 높은 순으로 정렬
		        .slice(0, 3); // 상위 3개만 추출

		    // 4. 지수 레벨 결정 (UI 표시용)
		    const happinessLevel = avgHappinessRatio >= 50 ? '높음 😄' : (avgHappinessRatio < 20 ? '낮음 😟' : '보통 😊');
		    const sadnessLevel = avgSadnessRatio >= 50 ? '높음 😢' : (avgSadnessRatio < 20 ? '낮음 🙂' : '보통 😐');

		    return {
		        // 월별 종합 통계
		        monthlyStats: {
		            happiness: {
		                percentage: Math.round(avgHappinessRatio * 10) / 10,
		                level: happinessLevel
		            },
		            sadness: {
		                percentage: Math.round(avgSadnessRatio * 10) / 10,
		                level: sadnessLevel
		            }
		        },
		        // TOP 3 일기 목록
		        top3Days: top3SaddestDays
		    };
		}
		/**
		 * TOP 3 일기 버튼에 클릭 이벤트를 바인딩합니다.
		 */
		function bindDiaryDetailEvents() {
		    // 클래스가 'top-diary-btn'인 모든 버튼을 선택합니다.
		    const topDiaryButtons = document.querySelectorAll('.top-diary-btn');

		    topDiaryButtons.forEach(button => {
		        // 기존 리스너 중복 방지를 위해 이벤트 핸들러를 제거 후 다시 추가할 수 있습니다.
		        // 여기서는 간단하게 기존 것을 유지하고 새로 바인딩합니다.

		        button.onclick = function() {
		            const diaryId = this.dataset.diaryIdx;
		            const date = this.dataset.date;
		            if (diaryId && date) {
		                showDiaryDetailModal(diaryId, date);
		            }
		        };
		    });
		}
		
		/**
		 * 달력의 일기 작성 날짜 셀에 클릭 이벤트를 바인딩합니다.
		 */
		function bindCalendarEvents() {
		    // 일기가 작성되어 data-diary-id를 가진 모든 셀을 선택합니다.
		    const diaryDays = document.querySelectorAll('.calendar-day[data-diary-idx]');

		    diaryDays.forEach(cell => {
		        cell.onclick = function() {
		            const diaryId = this.dataset.diaryIdx;
		            const date = this.dataset.date;
		            if (diaryId && date) {
		                showDiaryDetailModal(diaryId, date);
		            }
		        };
		    });
		}
		
		/**
		 * 일기 상세 모달을 띄우고 데이터를 로드하는 함수
		 * @param {string} diaryId - 조회할 일기의 고유 ID (Diary.diaryIdx)
		 * @param {string} date - 일기 작성 날짜 (YYYY-MM-DD 형식) - 모달 제목 표시용
		 */
		function showDiaryDetailModal(diaryId, date) {
		    const modalElement = document.getElementById('diaryDetailModal');
		    if (!modalElement) {
		        console.error("Diary Detail Modal element not found. Please check the modal ID.");
		        return;
		    }

		    // 2. 일기 데이터를 서버에서 로드하는 API 호출
		    fetch(`/api/diaries/detail/${diaryId}`) // Controller에서 정의한 엔드포인트 사용
		        .then(res => {
		            if (!res.ok) {
		                // 404 등의 오류 응답 처리
		                throw new Error(`HTTP error! status: ${res.status}`);
		            }
		            return res.json();
		        })
		        .then(diaryData => {					
					const diaryDetailModal = new bootstrap.Modal(document.getElementById('diaryDetailModal'));
					
					if (diaryData) {
						fillModalWithData(diaryData);
						diaryDetailModal.show(); // 모달 표시
					}
		        })
		        .catch(error => {
		            console.error("일기 상세 로드 실패:", error);
		            alert("일기 상세 정보를 불러오는 데 실패했습니다. 오류: " + error.message);
		        });
		}
		
		/**
		 * 월별 분석 화면의 통계 카드, TOP 3 목록, 차트 영역을 초기 상태로 리셋합니다.
		 */
		function initializeAnalysisUI(year, month) {
		    // 1. 주요 컨테이너 요소 가져오기 (가정된 ID/클래스)
		    const chartGrid = document.querySelector('.chart-grid');
		    const chartDisplayArea = document.getElementById('chartDisplayArea'); // 차트가 표시되는 영역의 ID를 가정
		    
		    // 캘린더는 별도 함수로 리셋되어야 하지만, 여기서는 가이드라인만 제시합니다.
		    //resetCalendarHighlighting();
			
			renderCalendar(year, month, []);
			chartGrid.innerHTML = '';
			renderCharts([]);
			elementShow('.row.gx-4');
		    
		    if (chartGrid) {
		        const statCardContent = chartGrid.querySelector('.p-3:first-child');
		        const top3ListContainer = chartGrid.querySelector('.top-diary-list-container');

		        // --- 2. 통계 카드 (이 달의 마음 상태) 초기화 ---
		        if (statCardContent) {
		            // 종합 우울지수 (P 태그 내부의 span)
		            const sadnessLevelSpan = statCardContent.querySelector('.mb-1.fw-semibold:nth-child(2) span');
		            if (sadnessLevelSpan) {
		                // 초기값으로 "보통 😊" 또는 "분석 대기 중" 등으로 설정
		                sadnessLevelSpan.innerHTML = '보통 😊'; 
		            }
		            
		            // 우울지수 바 (.indicator-fill)
		            const sadnessBarFill = statCardContent.querySelector('.indicator-bar:nth-child(3) .indicator-fill');
		            if (sadnessBarFill) {
		                sadnessBarFill.style.width = '0%'; // 폭 0%로 초기화
		                sadnessBarFill.style.backgroundColor = 'var(--mood-neutral)'; // 중립 색상으로 변경
		            }
		            
		            // 종합 행복지수 (P 태그 내부의 span)
		            const happinessLevelSpan = statCardContent.querySelector('.mb-1.fw-semibold:nth-child(4) span');
		            if (happinessLevelSpan) {
		                happinessLevelSpan.innerHTML = '보통 😊'; 
		            }
		            
		            // 행복지수 바 (.indicator-fill)
		            const happinessBarFill = statCardContent.querySelector('.indicator-bar:nth-child(5) .indicator-fill');
		            if (happinessBarFill) {
		                happinessBarFill.style.width = '0%'; // 폭 0%로 초기화
		                happinessBarFill.style.backgroundColor = 'var(--mood-neutral)'; // 중립 색상으로 변경
		            }
		        }

		        // --- 3. TOP 3 일기 목록 초기화 ---
		        if (top3ListContainer) {
		            // TOP 3 일기 목록 컨테이너의 내용을 비웁니다.
		            /*top3ListContainer.innerHTML = `
		                <button class="top-diary-btn disabled">TOP 1 일기: 데이터 없음</button>
		                <button class="top-diary-btn disabled">TOP 2 일기: 데이터 없음</button>
		                <button class="top-diary-btn disabled">TOP 3 일기: 데이터 없음</button>
		            `;*/
		            top3ListContainer.innerHTML = '';
		        }
		    }

		    // --- 4. 차트 영역 초기화 및 데이터 없음 메시지 표시 ---
		    if (chartDisplayArea) {
		        // 차트 영역을 비우고 "데이터 없음" 메시지를 표시합니다. (image_e0eb08.png 참조)
		        chartDisplayArea.innerHTML = `
		            <div class="no-data-message text-center p-5">
		                <div class="chart-icon" style="font-size: 3em;">📊</div>
		                <p class="mt-3 fw-bold">데이터가 없어 차트 분석을 할 수 없어요.</p>
		                <p class="text-muted">해당 월에 작성된 일기가 없습니다.</p>
		            </div>
		        `;
		        // 이전에 생성된 Chart.js 인스턴스가 있다면 파괴(destroy)하는 로직도 추가해야 합니다.
		        // if (window.myChartInstance) { window.myChartInstance.destroy(); }
		    }
		}
});