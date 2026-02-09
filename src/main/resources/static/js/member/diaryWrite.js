/**
 * diaryWrite.js - 일기 작성 관련 JavaScript
 * 기능: 기분 선택, 일기 저장, 일기 수정
 */

// 기분 선택 상태 관리
let selectedMood = null;

// 현재 날짜 표시 업데이트
function initializeDateDisplay() {
    const today = new Date();
    const dateString = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][today.getDay()]})`;
    const dateElement = document.querySelector('#write-panel .card-title small');
    if (dateElement) {
        dateElement.textContent = dateString;
    }
}

// 기분 선택 버튼 이벤트 설정
function initializeMoodButtons() {
    $('#diaryMood button').on('click', function() {
        $('#diaryMood button').removeClass('active btn-mood-selected');
        $(this).addClass('active btn-mood-selected');
        selectedMood = $(this).data('mood');
    });
}

// 일기 저장 API 호출
function callSaveDiaryApi() {
    const diaryTitle = $('#diaryTitle').val().trim();
    const diaryContent = $('#diaryContent').val().trim();
    const memberId = $('#memberId').val();

    if (!diaryTitle || !diaryContent) {
        alert("제목과 오늘의 이야기를 모두 입력해주세요.");
        return;
    }

    const dataToSend = {
        memberId: memberId,
        diaryTitle: diaryTitle,
        diaryContent: diaryContent,
        file1: null,
        file2: null,
        file3: null
    };

    $('#saveDiaryBtn').prop('disabled', true).text('일기 저장 및 AI 분석 중...');

    $.ajax({
        url: "/api/diaries",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(dataToSend),
        success: function(savedDiary, status, xhr) {
            alert("새로운 일기 저장이 완료되었으며, AI 분석을 요청했습니다. 잠시 후 '통계' 탭에서 결과를 확인해주세요.");

            $('#diaryTitle').val('');
            $('#diaryContent').val('');
            $('#diaryMood button').removeClass('active btn-mood-selected');
            selectedMood = null;

            if (typeof loadTodayDiary === 'function') {
                loadTodayDiary();
            }
        },
        error: function(xhr, status, error) {
            console.error("에러 발생:", error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "알 수 없는 오류가 발생했습니다.";
            alert("일기 저장 중 오류가 발생했습니다: " + errorMsg);
        },
        complete: function() {
            $('#saveDiaryBtn').prop('disabled', false).text('일기 저장하기');
        }
    });
}

// 일기 수정 API 호출
function callUpdateDiaryApi(diaryIdx) {
    const diaryTitle = $('#diaryTitle').val().trim();
    const diaryContent = $('#diaryContent').val().trim();
    const memberId = $('#memberId').val();

    if (!diaryTitle || !diaryContent) {
        alert("제목과 오늘의 이야기를 모두 입력해주세요.");
        return;
    }

    const dataToSend = {
        memberId: memberId,
        diaryTitle: diaryTitle,
        diaryContent: diaryContent,
        file1: null,
        file2: null,
        file3: null
    };

    $('#saveDiaryBtn').prop('disabled', true).text('일기 수정 및 AI 분석 중...');

    $.ajax({
        url: `/api/diaries/${diaryIdx}`,
        type: "PUT",
        contentType: "application/json",
        data: JSON.stringify(dataToSend),
        success: function(savedDiary, status, xhr) {
            alert("일기 수정이 완료되었으며, AI 분석을 요청했습니다.");

            if (typeof loadTodayDiary === 'function') {
                loadTodayDiary();
            }
        },
        error: function(xhr, status, error) {
            console.error("에러 발생:", error);
            const errorMsg = xhr.responseJSON ? xhr.responseJSON.message : "알 수 없는 오류가 발생했습니다.";
            alert("일기 수정 중 오류가 발생했습니다: " + errorMsg);
        },
        complete: function() {
            $('#saveDiaryBtn').prop('disabled', false).text('일기 저장하기');
        }
    });
}

// 일기 저장 버튼 이벤트 설정
function initializeSaveButton() {
    const $currentDiaryIdx = document.getElementById('currentDiaryIdx');

    $('#saveDiaryBtn').on('click', function() {
        if ($currentDiaryIdx.value === '' || $currentDiaryIdx.value === '0') {
            console.log('POST - 새 일기 저장');
            callSaveDiaryApi();
        } else {
            console.log('PUT - 일기 수정');
            callUpdateDiaryApi($currentDiaryIdx.value);
        }
    });
}

// 글자 수 카운터 초기화
function initializeCharacterCount() {
    const titleInput = document.getElementById('diaryTitle');
    const contentTextarea = document.getElementById('diaryContent');
    const titleCounter = document.getElementById('titleCurrentLength');
    const contentCounter = document.getElementById('contentCurrentLength');

    const MAX_TITLE_LENGTH = 30;
    const MAX_CONTENT_LENGTH = 1000;

    const updateCharacterCount = (element, maxLength, counterElement) => {
        if (!element || !counterElement) return;

        let currentLength = element.value.length;

        if (currentLength > maxLength) {
            element.value = element.value.substring(0, maxLength);
            currentLength = maxLength;
        }

        counterElement.textContent = currentLength;

        if (currentLength >= maxLength) {
            counterElement.parentElement.classList.replace('text-gray-500', 'text-red-500');
        } else {
            counterElement.parentElement.classList.replace('text-red-500', 'text-gray-500');
        }
    };

    if (titleInput && titleCounter) {
        titleInput.addEventListener('input', () => {
            updateCharacterCount(titleInput, MAX_TITLE_LENGTH, titleCounter);
        });
        updateCharacterCount(titleInput, MAX_TITLE_LENGTH, titleCounter);
    }

    if (contentTextarea && contentCounter) {
        contentTextarea.addEventListener('input', () => {
            updateCharacterCount(contentTextarea, MAX_CONTENT_LENGTH, contentCounter);
        });
        updateCharacterCount(contentTextarea, MAX_CONTENT_LENGTH, contentCounter);
    }
}

// 일기 작성 모듈 초기화
function initializeDiaryWrite() {
    initializeDateDisplay();
    initializeMoodButtons();
    initializeSaveButton();
    initializeCharacterCount();
}

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', initializeDiaryWrite);
