/**
 * common.js - 회원 페이지 공통 JavaScript
 * 기능: 네비게이션 바, YouTube 검색, 유틸리티 함수
 */

// YouTube 검색 대기 상태
let youtubeSearchKeyword = "";

// 네비게이션 바 호버 효과 초기화
function initializeNavbar() {
    const customNavbar = document.querySelector('.custom-navbar');
    const menucon = document.getElementById("menucon");

    if (customNavbar && menucon) {
        customNavbar.addEventListener('mouseover', function() {
            menucon.style.display = "block";
        });

        customNavbar.addEventListener('mouseout', function() {
            menucon.style.display = "none";
        });
    }
}

// YouTube 검색 초기화
function initializeYoutubeSearch(aiApiUrl) {
    const buttonContainer = document.getElementById('diaryMood');
    if (!buttonContainer) return;

    buttonContainer.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            const selectedValue = event.target.value;
            const waitChk = document.getElementById('waitChk');

            if (!waitChk || waitChk.value === '0') {
                if (waitChk) waitChk.value = '1';

                youtubeSearchKeyword = selectedValue;

                $.ajax({
                    url: aiApiUrl + "/youtube/search",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify({
                        keyword: youtubeSearchKeyword
                    }),
                    success: function(result) {
                        console.log(result);
                        const tbody = $("#youtubeResult").empty();
                        const data = result.results;

                        let keywordSet = youtubeSearchKeyword;
                        const emojiMap = {
                            '분노': '🔥',
                            '불안': '😟',
                            '기쁨': '😊',
                            '슬픔': '😢',
                            '후회': '😔',
                            '희망': '✨',
                            '중립': '😐',
                            '피로': '😴',
                            '우울': '💙'
                        };
                        keywordSet += emojiMap[youtubeSearchKeyword] || '🔥';

                        data.forEach((board, idx) => {
                            tbody.append(`
                                <div class="diary-item-card mood-${youtubeSearchKeyword}"
                                     onclick="window.open('${board.link}', '힐링케어', 'width=600,height=320');">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <h5 class="fw-bold mb-1">${board.name}</h5>
                                        <span class="diary-mood-tag mood-${youtubeSearchKeyword}">${keywordSet}</span>
                                    </div>
                                    <p class="text-muted mb-2" style="font-size: 0.9em;">
                                        ${board.videoDate} | ${board.viewCount}
                                    </p>
                                    <p class="mb-0 text-truncate">${board.videoDescript}</p>
                                </div>
                            `);
                        });

                        if (waitChk) waitChk.value = '0';
                    },
                    error: function(xhr, status, error) {
                        console.error("YouTube 검색 오류:", error);
                        if (waitChk) waitChk.value = '0';
                    }
                });
            } else {
                alert("[" + youtubeSearchKeyword + "]의 데이터를 가져오는 중입니다.\n완료가 되면 다시 선택해 주십시오.");
            }
        }
    });
}

// 주소 검색 (다음 우편번호 API)
function searchAddress(zipCodeSelector, addressSelector, detailSelector) {
    new daum.Postcode({
        oncomplete: function(data) {
            $(zipCodeSelector).val(data.zonecode);
            $(addressSelector).val(data.roadAddress);
            $(detailSelector).focus();
        }
    }).open();
}

// 마이페이지 주소 검색 버튼 초기화
function initializeAddressSearch() {
    $("#searchZipCodeBtn").on("click", function(e) {
        e.preventDefault();
        searchAddress('#zipCode', '#streetAdr', '#inputAddressDetail');
    });
}

// 탭 활성화 시 이벤트 처리
function initializeTabEvents() {
    // 홈 탭 활성화 시
    $('#home-tab').on('shown.bs.tab', function(e) {
        console.log('홈 탭 활성화');
    });

    // 일기 작성 탭 활성화 시
    $('#write-tab').on('shown.bs.tab', function(e) {
        console.log('일기 작성 탭 활성화');
        if (typeof loadTodayDiary === 'function') {
            loadTodayDiary();
        }
    });

    // 마이페이지 탭 활성화 시
    $('#mypage-tab').on('shown.bs.tab', function(e) {
        console.log('마이페이지 탭 활성화');
        const MEMBER_ID = document.getElementById('memberId') ? document.getElementById('memberId').value : null;
        if (MEMBER_ID && typeof loadMemberData === 'function') {
            loadMemberData(MEMBER_ID);
        }
    });
}

// 공통 유틸리티 함수
const MemberUtils = {
    // 날짜 포맷팅
    formatDate: function(date, format) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekDay = weekDays[d.getDay()];

        if (format === 'full') {
            return `${year}년 ${month}월 ${day}일 (${weekDay})`;
        } else if (format === 'short') {
            return `${year}.${month}.${day}`;
        }
        return `${year}-${month}-${day}`;
    },

    // 로컬 스토리지 저장
    saveToStorage: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('로컬 스토리지 저장 오류:', e);
        }
    },

    // 로컬 스토리지 로드
    loadFromStorage: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('로컬 스토리지 로드 오류:', e);
            return null;
        }
    },

    // 에러 메시지 표시
    showError: function(message) {
        alert(message);
    },

    // 성공 메시지 표시
    showSuccess: function(message) {
        alert(message);
    }
};

// 공통 모듈 초기화
function initializeCommon(aiApiUrl) {
    initializeNavbar();
    initializeAddressSearch();
    initializeTabEvents();

    if (aiApiUrl) {
        initializeYoutubeSearch(aiApiUrl);
    }
}

// 전역으로 노출 (Thymeleaf 템플릿에서 호출용)
window.initializeCommon = initializeCommon;
window.MemberUtils = MemberUtils;
window.searchAddress = searchAddress;
