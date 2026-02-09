/**
 * diaryList.js - 일기 목록 관련 JavaScript
 * 기능: 일기 목록 로드, 렌더링, 페이징, 검색, 상세 모달
 */

// 전역 설정
const DIARY_PAGE_SIZE = 4;

// DOM 요소 캐시
let $listPanel, $diaryListContainer, $paginationNav;
let $keywordSearch, $searchButton, $yearSearch, $monthSearch, $daySearch, $totalDiaryCount;
let diaryDetailModal, $modalTitle, $modalDateInfo, $modalContent, $modalAnalysisResult;
let $writePanel, $currentDiaryIdx, $diaryTitle, $diaryContent, $dateDisplay;

// 기분 이모지 매핑
function getMoodEmoji(mood) {
    const emojiMap = {
        '기쁨': '😊',
        '슬픔': '😢',
        '분노': '🔥',
        '불안': '😟',
        '후회': '😔',
        '희망': '✨',
        '피로': '😴',
        '우울': '💙',
        '중립': '😐'
    };
    return emojiMap[mood] || '📝';
}

// 일기 목록 API 호출 및 렌더링
async function loadDiaries(page = 0) {
    const MEMBER_ID = document.getElementById('memberId') ? document.getElementById('memberId').value : '1';

    if (!MEMBER_ID || !$diaryListContainer) return;

    $diaryListContainer.innerHTML = '<p class="text-center text-info py-5">일기 목록을 불러오는 중...</p>';

    const keyword = $keywordSearch ? $keywordSearch.value.trim() : '';
    const year = $yearSearch ? $yearSearch.value.trim() : '';
    const month = $monthSearch ? $monthSearch.value.trim() : '';
    const day = $daySearch ? $daySearch.value.trim() : '';

    const params = new URLSearchParams({
        page: page,
        size: DIARY_PAGE_SIZE
    });

    const bodyData = {
        year: year,
        month: month,
        day: day,
        keyword: keyword
    };

    const url = `/api/diaries/list/${MEMBER_ID}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const pageData = await response.json();
        console.log("pageData content:", JSON.stringify(pageData));

        renderDiaryList(pageData.content);
        renderPagination(pageData.page);

        if ($totalDiaryCount) {
            $totalDiaryCount.textContent = `총 ${pageData.page.totalElements}개의 일기가 기록되어 있습니다.`;
        }

        bindDiaryClickEvents(pageData.content);

    } catch (error) {
        console.error("일기 목록 로드 실패:", error);
        $diaryListContainer.innerHTML = `<p class="text-danger text-center py-5">일기 목록을 불러오는 데 실패했습니다.</p>`;
        if ($paginationNav) {
            $paginationNav.innerHTML = '';
        }
    }
}

// 일기 목록 렌더링
function renderDiaryList(diaries) {
    if (!$diaryListContainer) return;

    if (diaries.length === 0) {
        $diaryListContainer.innerHTML = '<p class="text-center text-muted mt-5">검색 조건에 맞는 일기가 없습니다.</p>';
        return;
    }

    const html = diaries.map(diary => {
        const diaryDate = new Date(diary.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: "long",
            hour: "2-digit",
            minute: "2-digit"
        }).replace(/\. /g, '.').replace(/\.$/, '');

        const moods = [
            diary.anxietyRatio,
            diary.sadnessRatio,
            diary.joyRatio,
            diary.angerRatio,
            diary.regretRatio,
            diary.hopeRatio,
            diary.tirednessRatio,
            diary.depressionRatio,
            diary.neutralityRatio
        ];

        const maxValue = Math.max(...moods);
        const maxIndex = moods.indexOf(maxValue);

        const moodNames = ['불안', '슬픔', '기쁨', '분노', '후회', '희망', '피로', '우울', '중립'];
        const mood = moodNames[maxIndex] || '기록';
        const moodEmoji = getMoodEmoji(mood);

        return `
            <div class="diary-item-card mood-${mood}" data-idx="${diary.diaryIdx}">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="fw-bold mb-1">${diary.diaryTitle}</h5>
                    <span class="diary-mood-tag mood-${mood}">${mood} ${moodEmoji}</span>
                </div>
                <p class="text-muted mb-2" style="font-size: 0.9em;">${diaryDate}</p>
                <p class="mb-0 text-truncate">${diary.diaryContent}</p>
            </div>
        `;
    }).join('');

    $diaryListContainer.innerHTML = html;
}

// 페이지네이션 렌더링
function renderPagination(pageData) {
    if (!$paginationNav) return;

    const { number, totalPages } = pageData;
    const first = (number === 0);
    const last = (number >= totalPages - 1);

    if (totalPages <= 1) {
        $paginationNav.innerHTML = '';
        return;
    }

    let html = '';

    // 이전 버튼
    html += `<li class="page-item ${first ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${number - 1}" aria-label="Previous">&laquo;</a>
    </li>`;

    // 페이지 번호
    const startPage = Math.max(0, number - 2);
    const endPage = Math.min(totalPages - 1, number + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === number ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
        </li>`;
    }

    // 다음 버튼
    html += `<li class="page-item ${last ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${number + 1}" aria-label="Next">&raquo;</a>
    </li>`;

    $paginationNav.innerHTML = html;

    // 페이지 클릭 이벤트
    $paginationNav.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = parseInt(this.dataset.page);
            if (!isNaN(page) && page >= 0) {
                loadDiaries(page);
            }
        });
    });
}

// 일기 카드 클릭 이벤트 바인딩
function bindDiaryClickEvents(diaries) {
    const cards = document.querySelectorAll('.diary-item-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const diaryIdx = this.dataset.idx;
            const diaryData = diaries.find(d => String(d.diaryIdx) === diaryIdx);

            if (diaryData && diaryDetailModal) {
                fillModalWithData(diaryData);
                diaryDetailModal.show();
            }
        });
    });
}

// 모달에 데이터 채우기
function fillModalWithData(diaryData) {
    if ($modalTitle) {
        $modalTitle.textContent = diaryData.diaryTitle;
    }

    if ($modalDateInfo) {
        const date = new Date(diaryData.createdAt);
        $modalDateInfo.textContent = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    if ($modalContent) {
        $modalContent.textContent = diaryData.diaryContent;
    }

    if ($modalAnalysisResult) {
        const analysisHtml = generateAnalysisHtml(diaryData);
        $modalAnalysisResult.innerHTML = analysisHtml;
    }
}

// 분석 결과 HTML 생성
function generateAnalysisHtml(diaryData) {
    const emotions = [
        { name: '불안', ratio: diaryData.anxietyRatio, color: 'var(--mood-anxiety)' },
        { name: '슬픔', ratio: diaryData.sadnessRatio, color: 'var(--mood-sad)' },
        { name: '기쁨', ratio: diaryData.joyRatio, color: 'var(--mood-joy)' },
        { name: '분노', ratio: diaryData.angerRatio, color: 'var(--mood-anger)' },
        { name: '후회', ratio: diaryData.regretRatio, color: 'var(--mood-regret)' },
        { name: '희망', ratio: diaryData.hopeRatio, color: '#ffd700' },
        { name: '피로', ratio: diaryData.tirednessRatio, color: '#9e9e9e' },
        { name: '우울', ratio: diaryData.depressionRatio, color: '#5c6bc0' },
        { name: '중립', ratio: diaryData.neutralityRatio, color: '#78909c' }
    ];

    return emotions.map(emotion => `
        <div class="mood-analysis-item">
            <span>${emotion.name}</span>
            <div class="mood-bar-container">
                <div class="mood-bar-fill" style="background-color: ${emotion.color}; width: ${emotion.ratio || 0}%;">
                    ${Math.round(emotion.ratio || 0)}%
                </div>
            </div>
        </div>
    `).join('');
}

// 검색 이벤트 초기화
function initializeSearchEvents() {
    if ($searchButton) {
        $searchButton.addEventListener('click', () => loadDiaries(0));
    }

    if ($keywordSearch) {
        $keywordSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadDiaries(0);
            }
        });
    }

    // 날짜 검색 변경 시 자동 검색
    [$yearSearch, $monthSearch, $daySearch].forEach(el => {
        if (el) {
            el.addEventListener('change', () => loadDiaries(0));
        }
    });
}

// 오늘의 일기 로드
async function loadTodayDiary() {
    const MEMBER_ID = document.getElementById('memberId') ? document.getElementById('memberId').value : null;
    if (!MEMBER_ID) return;

    try {
        const response = await fetch(`/api/diaries/today/${MEMBER_ID}`);

        if (response.ok) {
            const diary = await response.json();

            if (diary && $diaryTitle && $diaryContent && $currentDiaryIdx) {
                $diaryTitle.value = diary.diaryTitle || '';
                $diaryContent.value = diary.diaryContent || '';
                $currentDiaryIdx.value = diary.diaryIdx || '';
            }
        }
    } catch (error) {
        console.error("오늘의 일기 로드 실패:", error);
    }
}

// 일기 목록 모듈 초기화
function initializeDiaryList() {
    // DOM 요소 캐싱
    $listPanel = document.getElementById('list-panel');
    if (!$listPanel) return;

    $diaryListContainer = $listPanel.querySelector('.diary-list');
    $paginationNav = $listPanel.querySelector('nav[aria-label="Diary Pagination"] ul') ||
                     $listPanel.querySelector('.pagination');

    $keywordSearch = $listPanel.querySelector('.input-group input[type="text"]');
    $searchButton = $listPanel.querySelector('.input-group button');
    $yearSearch = document.getElementById('yearSearch');
    $monthSearch = document.getElementById('monthSearch');
    $daySearch = document.getElementById('daySearch');
    $totalDiaryCount = $listPanel.querySelector('p.text-muted');

    // 모달 요소
    const modalElement = document.getElementById('diaryDetailModal');
    if (modalElement) {
        diaryDetailModal = new bootstrap.Modal(modalElement);
        $modalTitle = document.getElementById('diaryDetailModalLabel');
        $modalDateInfo = document.getElementById('modal-date-info');
        $modalContent = document.getElementById('modal-diary-content');
        $modalAnalysisResult = document.getElementById('modal-analysis-result');
    }

    // 작성 패널 요소
    $writePanel = document.getElementById('write-panel');
    $currentDiaryIdx = document.getElementById('currentDiaryIdx');
    $diaryTitle = document.getElementById('diaryTitle');
    $diaryContent = document.getElementById('diaryContent');

    // 페이지네이션 컨테이너가 없으면 생성
    if ($diaryListContainer && !$paginationNav) {
        $diaryListContainer.innerHTML = '';
        $diaryListContainer.insertAdjacentHTML('afterend',
            '<nav aria-label="Diary Pagination" class="mt-4"><ul class="pagination justify-content-center"></ul></nav>');
        $paginationNav = $listPanel.querySelector('nav[aria-label="Diary Pagination"] ul');
    }

    initializeSearchEvents();
}

// 일기 목록 탭 활성화 시 로드
function setupDiaryListTab() {
    const listTab = document.getElementById('list-tab');
    if (listTab) {
        listTab.addEventListener('shown.bs.tab', function() {
            loadDiaries(0);
        });
    }
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeDiaryList();
    setupDiaryListTab();
});
