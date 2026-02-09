/**
 * diary-list.js - 일기 목록 페이지 JavaScript
 * 독립 페이지용으로 리팩토링
 */

(function() {
    'use strict';

    // 설정
    const DIARY_PAGE_SIZE = 4;

    // DOM 요소
    let $diaryListContainer, $paginationNav, $totalDiaryCount;
    let $keywordSearch, $searchButton, $yearSearch, $monthSearch, $daySearch;
    let diaryDetailModal, $modalTitle, $modalDateInfo, $modalContent, $modalAnalysisResult;
    let MEMBER_ID;

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

    // 일기 목록 API 호출
    async function loadDiaries(page = 0) {
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

        if (!diaries || diaries.length === 0) {
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
            <a class="page-link" href="#" data-page="${number - 1}" aria-label="Previous">이전</a>
        </li>`;

        // 페이지 번호
        const displayPageCount = 5;
        let startPage = Math.max(0, number - Math.floor(displayPageCount / 2));
        let endPage = Math.min(totalPages - 1, startPage + displayPageCount - 1);

        if (endPage - startPage < displayPageCount - 1) {
            startPage = Math.max(0, endPage - displayPageCount + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<li class="page-item ${i === number ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i + 1}</a>
            </li>`;
        }

        // 다음 버튼
        html += `<li class="page-item ${last ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${number + 1}" aria-label="Next">다음</a>
        </li>`;

        $paginationNav.innerHTML = html;

        // 페이지 클릭 이벤트
        $paginationNav.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (this.closest('.page-item').classList.contains('disabled')) return;
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
    function fillModalWithData(diary) {
        const dateString = diary.createdAt.replace(/\+00:00$/, 'Z');
        const dateObject = new Date(dateString);

        const detailedDate = dateObject.toLocaleString('ko-KR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            weekday: "long", hour: "2-digit", minute: "2-digit", second: "2-digit"
        });

        if ($modalTitle) {
            $modalTitle.textContent = diary.diaryTitle;
        }

        if ($modalDateInfo) {
            $modalDateInfo.innerHTML = `
                <span class="badge bg-primary me-2">작성자: ${diary.memberName || '미확인'}</span>
                <span class="badge bg-secondary">${detailedDate}</span>
            `;
        }

        if ($modalContent) {
            $modalContent.textContent = diary.diaryContent;
        }

        if ($modalAnalysisResult) {
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
            $modalAnalysisResult.innerHTML = analysisHtml;
        }
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
                el.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        loadDiaries(0);
                    }
                });
            }
        });
    }

    // 초기화
    function initialize() {
        // 멤버 ID
        const memberIdEl = document.getElementById('memberId');
        MEMBER_ID = memberIdEl ? memberIdEl.value : null;

        if (!MEMBER_ID) {
            console.error('로그인한 사용자 정보를 찾을 수 없습니다.');
            return;
        }

        // DOM 요소 캐싱
        $diaryListContainer = document.getElementById('diaryListContainer');
        $paginationNav = document.getElementById('paginationNav');
        $totalDiaryCount = document.getElementById('totalDiaryCount');

        $keywordSearch = document.getElementById('keywordSearch');
        $searchButton = document.getElementById('searchButton');
        $yearSearch = document.getElementById('yearSearch');
        $monthSearch = document.getElementById('monthSearch');
        $daySearch = document.getElementById('daySearch');

        // 모달 요소
        const modalElement = document.getElementById('diaryDetailModal');
        if (modalElement) {
            diaryDetailModal = new bootstrap.Modal(modalElement);
            $modalTitle = document.getElementById('diaryDetailModalLabel');
            $modalDateInfo = document.getElementById('modal-date-info');
            $modalContent = document.getElementById('modal-diary-content');
            $modalAnalysisResult = document.getElementById('modal-analysis-result');
        }

        initializeSearchEvents();

        // 초기 일기 목록 로드
        loadDiaries(0);
    }

    // DOM 로드 완료 시 초기화
    document.addEventListener('DOMContentLoaded', initialize);
})();
