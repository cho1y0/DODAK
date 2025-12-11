document.addEventListener('DOMContentLoaded', () => {
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

			alert(`[일기 저장 요청]\n선택된 기분: ${selectedMood}\n제목: ${title}\n내용: ${content.substring(0, 50)}...\n\n(실제 저장 로직은 서버에서 처리됩니다.)`);

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
		1: 'var(--mood-anger)', 3: 'var(--mood-anxiety)', 5: 'var(--mood-anxiety)',
		6: 'var(--mood-regret)', 7: 'var(--mood-regret)', 9: 'var(--mood-joy)',
		10: 'var(--mood-joy)', 11: 'var(--mood-joy)', 12: 'var(--mood-regret)',
		13: 'var(--mood-regret)', 16: 'var(--mood-joy)', 17: 'var(--mood-joy)'
	};

	function renderCalendar(year, month) {
		currentMonthDisplay.textContent = `${month}월`;
		yearSelect.value = year;

		// ... (달력 날짜 생성 로직) ...
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

		/*} else {
			// --- [나머지 달: 데이터가 없을 때] ---
		    
			// 통계 헤더 전체를 '준비 중' 메시지로 **완전히 대체**
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
		    
			// 통계 내용 및 일기 목록 숨김
			if (statsContent) statsContent.style.display = 'none'; 
			if (diaryListContainer) diaryListContainer.style.display = 'none'; 
		}*/

		const lastDay = new Date(year, month + 1, 0).getDate();

		// 제목 업데이트
		const monthNames = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
		//document.getElementById('monthTitle').textContent = `${year}년 ${monthNames[month]}`;

		/*const senseNames = ["분노", "불안", "슬픔", "기쁨", "후회"];
		for (let senseIdx = 0; senseIdx < senseNames.length; senseIdx++) {
			
		}*/

		let lineChartData = {
			labels: [1, 4, 11, 13, 18, 19, 20, 22, 25, 30],
			datasets: [{
				data: [90, 30, 20, 50, 20, 70, 90, 10, 50, 40],
				label: "행복",
				borderColor: "#3e95cd",
				fill: false
			}, {
				data: [6, 3, 2, 2, 7, 26, 82, 10, 20, 30],
				label: "우울",
				borderColor: "#c45850",
				fill: false
			}
			]
		};

		let lineChartDraw = function() {
			window.lineChart = new Chart(document.getElementById("line-chart"), {
				type: 'line',
				data: lineChartData,
				options: {
					title: {
						display: true,
						text: '행복 우울 지수 (Line Graph)'
					},
					responsive: false
				}
			});
		};




		let pieChartData = {
			labels: ['분노', '불안', '기쁨', '후회', '슬픔', '중립'],
			datasets: [{
				data: [95, 12, 13, 7, 13, 10],
				backgroundColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(153, 102, 255)']
			}]
		};

		let pieChartDraw = function() {
			let ctx = document.getElementById('pie-chart').getContext('2d');

			window.pieChart = new Chart(ctx, {
				type: 'pie',
				data: pieChartData,
				options: {
					responsive: false
				}
			});
		};


		pieChartDraw();
		lineChartDraw();		
		/*const tableBody = document.getElementById('calendarBody');
		let innerHtmlStr1 = "";
		for (let senseIdx = 0; senseIdx < senseNames.length; senseIdx++) {
			// 새로운 행 (<tr>) 생성
			innerHtmlStr1 += "<tr>"
						
			for (let day = 0; day <= lastDay; day++) {				
				if (day == 0) {
					innerHtmlStr1 += "<th>" + senseNames[senseIdx] + "</th>";
				} else {				
					if(day==1 || day==3 || day==5 || day==7 || day==9 || day==10 || day==11 || day==12 || day==13 || day==16 || day==17){
						innerHtmlStr1 += "<td>" + 15 + "</td>";	
					} else {
						innerHtmlStr1 += "<td>" +  0 + "</td>";
					}
							
				}				
			}
			innerHtmlStr1 += "</tr>"
		}
		console.log("innerHtmlStr1 : " + innerHtmlStr1);
		tableBody.innerHTML = innerHtmlStr1;

		const tableHead = document.getElementById('calendarHead');
		let innerHtmlStr2 = "";
		innerHtmlStr2 += "<tr>";
		// 1일부터 마지막 날까지 반복
		for (let day = 0; day <= lastDay; day++) {
			//const date = new Date(year, month, day);
			//const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)
			//const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
			
			if (day == 0) {
				innerHtmlStr2 += "<td></td>"; 
			} else {
				innerHtmlStr2 += "<th>" + day + "</th>";
			}
			// 두 번째 셀 (요일)
			//const cellDayOfWeek = row.insertCell();
			//cellDayOfWeek.textContent = dayNames[dayOfWeek];
		}
		innerHtmlStr2 += "</tr>";
		console.log("innerHtmlStr2 : " + innerHtmlStr2);
		tableHead.innerHTML = innerHtmlStr2;*/
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
	
	// 이전 달 버튼 클릭 이벤트
	prevMonthBtn.addEventListener('click', () => {
		
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

		console.log(`현재: ${currentYear}년 ${currentMonth}월`);
		console.log(`1년 전: ${oneYearAgo.year}년 ${oneYearAgo.month}월`);

		// 비교 로직 (예시)
		const date1 = new Date(currentYear, currentMonth - 1, 1);
		const date2 = new Date(oneYearAgo.year, oneYearAgo.month - 1, 1);

		console.log(date1 +":"+date2);
		console.log(date1 === date2);
		console.log(date1 < date2);
		console.log(date1 > date2); 
		if (date1 === date2) {
			
		    renderCalendar(currentYear, currentMonth);
		} else if (date1 < date2) {
			currentMonth++;
			if (currentMonth > 12) {
				currentMonth = 1;
				currentYear++;
			}
			const statsHeader = document.querySelector('#stats-panel .stats-header');
			yearSelect.value = currentYear;
			statsHeader.innerHTML = `${currentMonth}월의 마음 속 이야기
				                    <img src="/img/문서보는도닥이.png" alt="통계 도닥이" class="dodak-local-element dodak-stats-title-1">`;
		    console.log("검색 날짜가 1년 전 날짜보다 이전입니다.");
		} else {
		    renderCalendar(currentYear, currentMonth);
		}
	});

	// 다음 달 버튼 클릭 이벤트
	nextMonthBtn.addEventListener('click', () => {
		currentMonth++;
		if (currentMonth > 12) {
			currentMonth = 1;
			currentYear++;
		}
		
		const today = new Date();
		// 비교를 위해 오늘 날짜의 시, 분, 초, 밀리초를 0으로 설정하여 '일' 기준까지만 비교
		today.setHours(0, 0, 0, 0); 
		const year = today.getFullYear();
		const month = today.getMonth() + 1;  // 월
		// 입력된 연도와 월의 첫째 날을 기준으로 Date 객체 생성
		const inputDate = new Date(currentYear, currentMonth - 1, 1);
		console.log(`현재: ${year}년 ${month}월`);
		console.log(`검색 년월: ${currentYear}년 ${currentMonth}월`);
		console.log(inputDate === today);
		console.log(inputDate < today);
		console.log(inputDate > today);  
		// 비교
		if (inputDate === today) {
			renderCalendar(currentYear, currentMonth);
		} else if (inputDate < today) {
			renderCalendar(currentYear, currentMonth);
		} else {
			currentMonth--;
			if (currentMonth < 1) {
				currentMonth = 12;
				currentYear--;
			}
			const statsHeader = document.querySelector('#stats-panel .stats-header');
			yearSelect.value = currentYear;
			statsHeader.innerHTML = `${currentMonth}월의 마음 속 이야기
				                    <img src="/img/문서보는도닥이.png" alt="통계 도닥이" class="dodak-local-element dodak-stats-title-1">`;					
			console.log("검색 날짜가 현재 날짜보다 이후입니다.");
		}
		
		
	});
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
});