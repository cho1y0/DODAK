/**
 * diary-write.js - 일기 작성 페이지 JavaScript
 * 독립 페이지용으로 리팩토링
 */

(function() {
    'use strict';

    // 상태 관리
    let selectedMood = null;
    let MEMBER_ID = null;

    // DOM 요소
    let $diaryTitle, $diaryContent, $currentDiaryIdx, $saveDiaryBtn;
    let $todayDateDisplay, $titleCurrentLength, $contentCurrentLength;

    // 설정
    const MAX_TITLE_LENGTH = 30;
    const MAX_CONTENT_LENGTH = 1000;

    // 현재 날짜 표시
    function initializeDateDisplay() {
        const today = new Date();
        const dateString = `날짜: ${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;

        if ($todayDateDisplay) {
            $todayDateDisplay.textContent = dateString;
        }
    }

    // 기분 선택 버튼 이벤트
    function initializeMoodButtons() {
        const buttonContainer = document.getElementById('diaryMood');
        if (!buttonContainer) return;

        buttonContainer.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON') {
                // 모든 버튼에서 active 클래스 제거
                buttonContainer.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active', 'btn-mood-selected');
                });

                // 클릭된 버튼에 active 클래스 추가
                event.target.classList.add('active', 'btn-mood-selected');
                selectedMood = event.target.value;

                // YouTube 추천 검색
                searchYoutubeByMood(selectedMood);
            }
        });
    }

    // YouTube 검색
    function searchYoutubeByMood(mood) {
        if (!mood || typeof AI_API_URL === 'undefined' || !AI_API_URL) {
            console.log('AI_API_URL이 설정되지 않았습니다.');
            return;
        }

        const youtubeResult = document.getElementById('youtubeResult');
        if (!youtubeResult) return;

        youtubeResult.innerHTML = '<p class="text-center">영상을 검색 중입니다...</p>';

        fetch(`${AI_API_URL}/youtube/search?mood=${encodeURIComponent(mood)}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    const html = data.map(video => `
                        <div class="youtube-item mb-3">
                            <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" class="d-flex align-items-start text-decoration-none">
                                <img src="${video.thumbnail}" alt="${video.title}" class="me-3" style="width: 120px; height: 90px; object-fit: cover; border-radius: 8px;">
                                <div>
                                    <h6 class="mb-1 text-dark">${video.title}</h6>
                                    <small class="text-muted">${video.channelTitle}</small>
                                </div>
                            </a>
                        </div>
                    `).join('');
                    youtubeResult.innerHTML = html;
                } else {
                    youtubeResult.innerHTML = '<p class="text-muted text-center">추천 영상이 없습니다.</p>';
                }
            })
            .catch(error => {
                console.error('YouTube 검색 오류:', error);
                youtubeResult.innerHTML = '<p class="text-danger text-center">영상 검색 중 오류가 발생했습니다.</p>';
            });
    }

    // 오늘의 일기 로드
    async function loadTodayDiary() {
        if (!MEMBER_ID) return;

        try {
            const response = await fetch(`/api/diaries/today/${MEMBER_ID}`);

            if (response.ok) {
                const diaryData = await response.json();
                fillWriteForm(diaryData);
                console.log("오늘의 일기 데이터 로드 완료.");
            } else if (response.status === 404) {
                console.log("오늘 작성된 일기가 없습니다. 새 일기 작성.");
                resetWriteForm();
            } else {
                throw new Error(`HTTP Error: ${response.status}`);
            }
        } catch (error) {
            console.error("오늘 일기 로드 실패:", error);
        }
    }

    // 일기 폼 채우기 (수정 모드)
    function fillWriteForm(diary) {
        if ($currentDiaryIdx) {
            $currentDiaryIdx.value = diary.diaryIdx;
        }
        if ($diaryTitle) {
            $diaryTitle.value = diary.diaryTitle;
        }
        if ($diaryContent) {
            $diaryContent.value = diary.diaryContent;
        }

        // 저장 버튼 텍스트 변경 (수정 모드)
        if ($saveDiaryBtn) {
            $saveDiaryBtn.textContent = '일기 수정하기';
            $saveDiaryBtn.classList.add('btn-warning');
            $saveDiaryBtn.classList.remove('btn-dark');
        }

        // 글자 수 업데이트
        updateCharacterCounts();
    }

    // 폼 초기화 (새 일기 작성 모드)
    function resetWriteForm() {
        if ($currentDiaryIdx) {
            $currentDiaryIdx.value = '';
        }
        if ($diaryTitle) {
            $diaryTitle.value = '';
        }
        if ($diaryContent) {
            $diaryContent.value = '';
        }

        // 기분 버튼 초기화
        const buttonContainer = document.getElementById('diaryMood');
        if (buttonContainer) {
            buttonContainer.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active', 'btn-mood-selected');
            });
        }
        selectedMood = null;

        // 저장 버튼 텍스트 변경 (새 작성 모드)
        if ($saveDiaryBtn) {
            $saveDiaryBtn.textContent = '일기 저장하기';
            $saveDiaryBtn.classList.remove('btn-warning');
            $saveDiaryBtn.classList.add('btn-dark');
        }

        // 글자 수 업데이트
        updateCharacterCounts();
    }

    // 일기 저장 API 호출
    function callSaveDiaryApi() {
        const diaryTitle = $diaryTitle ? $diaryTitle.value.trim() : '';
        const diaryContent = $diaryContent ? $diaryContent.value.trim() : '';

        if (!diaryTitle || !diaryContent) {
            alert("제목과 오늘의 이야기를 모두 입력해주세요.");
            return;
        }

        const dataToSend = {
            memberId: MEMBER_ID,
            diaryTitle: diaryTitle,
            diaryContent: diaryContent,
            file1: null,
            file2: null,
            file3: null
        };

        if ($saveDiaryBtn) {
            $saveDiaryBtn.disabled = true;
            $saveDiaryBtn.textContent = '일기 저장 및 AI 분석 중...';
        }

        fetch('/api/diaries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || '일기 저장 실패'); });
            }
            return response.json();
        })
        .then(savedDiary => {
            alert("새로운 일기 저장이 완료되었으며, AI 분석을 요청했습니다. 잠시 후 '일기 목록'에서 결과를 확인해주세요.");
            loadTodayDiary();
        })
        .catch(error => {
            console.error("에러 발생:", error);
            alert("일기 저장 중 오류가 발생했습니다: " + error.message);
        })
        .finally(() => {
            if ($saveDiaryBtn) {
                $saveDiaryBtn.disabled = false;
                $saveDiaryBtn.textContent = '일기 저장하기';
            }
        });
    }

    // 일기 수정 API 호출
    function callUpdateDiaryApi(diaryIdx) {
        const diaryTitle = $diaryTitle ? $diaryTitle.value.trim() : '';
        const diaryContent = $diaryContent ? $diaryContent.value.trim() : '';

        if (!diaryTitle || !diaryContent) {
            alert("제목과 오늘의 이야기를 모두 입력해주세요.");
            return;
        }

        const dataToSend = {
            memberId: MEMBER_ID,
            diaryTitle: diaryTitle,
            diaryContent: diaryContent,
            file1: null,
            file2: null,
            file3: null
        };

        if ($saveDiaryBtn) {
            $saveDiaryBtn.disabled = true;
            $saveDiaryBtn.textContent = '일기 저장 및 AI 분석 중...';
        }

        fetch(`/api/diaries/${diaryIdx}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || '일기 수정 실패'); });
            }
            return response.json();
        })
        .then(savedDiary => {
            alert("일기 수정이 완료되었으며, AI 분석을 요청했습니다.");
            loadTodayDiary();
        })
        .catch(error => {
            console.error("에러 발생:", error);
            alert("일기 수정 중 오류가 발생했습니다: " + error.message);
        })
        .finally(() => {
            if ($saveDiaryBtn) {
                $saveDiaryBtn.disabled = false;
            }
            loadTodayDiary();
        });
    }

    // 저장 버튼 이벤트
    function initializeSaveButton() {
        if (!$saveDiaryBtn) return;

        $saveDiaryBtn.addEventListener('click', function() {
            const currentIdx = $currentDiaryIdx ? $currentDiaryIdx.value : '';

            if (!currentIdx || currentIdx === '0' || currentIdx === 'null') {
                console.log('POST - 새 일기 저장');
                callSaveDiaryApi();
            } else {
                console.log('PUT - 일기 수정');
                callUpdateDiaryApi(currentIdx);
            }
        });
    }

    // 글자 수 카운터
    function updateCharacterCounts() {
        if ($diaryTitle && $titleCurrentLength) {
            const len = $diaryTitle.value.length;
            $titleCurrentLength.textContent = len;
            if (len >= MAX_TITLE_LENGTH) {
                $titleCurrentLength.parentElement.style.color = '#dc3545';
            } else {
                $titleCurrentLength.parentElement.style.color = '#6c757d';
            }
        }

        if ($diaryContent && $contentCurrentLength) {
            const len = $diaryContent.value.length;
            $contentCurrentLength.textContent = len;
            if (len >= MAX_CONTENT_LENGTH) {
                $contentCurrentLength.parentElement.style.color = '#dc3545';
            } else {
                $contentCurrentLength.parentElement.style.color = '#6c757d';
            }
        }
    }

    function initializeCharacterCount() {
        if ($diaryTitle) {
            $diaryTitle.addEventListener('input', function() {
                if (this.value.length > MAX_TITLE_LENGTH) {
                    this.value = this.value.substring(0, MAX_TITLE_LENGTH);
                }
                updateCharacterCounts();
            });
        }

        if ($diaryContent) {
            $diaryContent.addEventListener('input', function() {
                if (this.value.length > MAX_CONTENT_LENGTH) {
                    this.value = this.value.substring(0, MAX_CONTENT_LENGTH);
                }
                updateCharacterCounts();
            });
        }

        updateCharacterCounts();
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
        $diaryTitle = document.getElementById('diaryTitle');
        $diaryContent = document.getElementById('diaryContent');
        $currentDiaryIdx = document.getElementById('currentDiaryIdx');
        $saveDiaryBtn = document.getElementById('saveDiaryBtn');
        $todayDateDisplay = document.getElementById('todayDateDisplay');
        $titleCurrentLength = document.getElementById('titleCurrentLength');
        $contentCurrentLength = document.getElementById('contentCurrentLength');

        initializeDateDisplay();
        initializeMoodButtons();
        initializeSaveButton();
        initializeCharacterCount();

        // 오늘의 일기 로드
        loadTodayDiary();
    }

    // DOM 로드 완료 시 초기화
    document.addEventListener('DOMContentLoaded', initialize);
})();
