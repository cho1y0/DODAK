/**
 * utils.js - 공통 유틸리티 JavaScript
 * 기능: 날짜 포맷팅, 감정 이모지, 유효성 검사, 공통 함수들
 */

// 공통 유틸리티 함수
const CommonUtils = {
    // 날짜 포맷팅
    formatDate: function(date, format) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
        const weekDay = weekDays[d.getDay()];
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        if (format === 'full') {
            return `${year}년 ${month}월 ${day}일 (${weekDay})`;
        } else if (format === 'fullWithTime') {
            return `${year}년 ${month}월 ${day}일 (${weekDay}) ${hours}:${minutes}`;
        } else if (format === 'short') {
            return `${year}.${month}.${day}`;
        } else if (format === 'korean') {
            return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
        }
        return `${year}-${month}-${day}`;
    },

    // 감정 이름에 따른 이모지 반환
    getMoodEmoji: function(mood) {
        const emojiMap = {
            '기쁨': '😊',
            '불안': '😟',
            '분노': '😡',
            '슬픔': '😢',
            '후회': '😔',
            '희망': '✨',
            '중립': '😐',
            '피로': '😴',
            '우울': '💙'
        };
        return emojiMap[mood] || '🗒️';
    },

    // 감정 비율에서 주요 감정 추출
    getDominantMood: function(moodRatios) {
        const moods = [
            { name: '불안', ratio: moodRatios.anxietyRatio || 0 },
            { name: '슬픔', ratio: moodRatios.sadnessRatio || 0 },
            { name: '기쁨', ratio: moodRatios.joyRatio || 0 },
            { name: '분노', ratio: moodRatios.angerRatio || 0 },
            { name: '후회', ratio: moodRatios.regretRatio || 0 },
            { name: '희망', ratio: moodRatios.hopeRatio || 0 },
            { name: '피로', ratio: moodRatios.tirednessRatio || 0 },
            { name: '우울', ratio: moodRatios.depressionRatio || 0 },
            { name: '중립', ratio: moodRatios.neutralityRatio || 0 }
        ];

        let maxMood = moods[0];
        moods.forEach(mood => {
            if (mood.ratio > maxMood.ratio) {
                maxMood = mood;
            }
        });

        return maxMood.name;
    },

    // 전화번호 형식 검사
    isValidPhoneNumber: function(phone) {
        const regex = /^0\d{1,2}-\d{3,4}-\d{4}$/;
        return regex.test(phone);
    },

    // 이메일 형식 검사
    isValidEmail: function(email) {
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
        return regex.test(email);
    },

    // 비밀번호 유효성 검사 (8-20자, 영문+숫자+특수문자)
    isValidPassword: function(password) {
        if (password.length < 8 || password.length > 20) {
            return { valid: false, message: '비밀번호는 8~20자 사이여야 합니다.' };
        }

        const hasLetter = /[a-zA-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^a-zA-Z0-9]/.test(password);

        if (!hasLetter || !hasNumber || !hasSpecial) {
            return { valid: false, message: '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.' };
        }

        return { valid: true, message: '유효한 비밀번호입니다.' };
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
    },

    // 주소 검색 (다음 우편번호 API)
    searchAddress: function(zipCodeSelector, addressSelector, detailSelector) {
        new daum.Postcode({
            oncomplete: function(data) {
                $(zipCodeSelector).val(data.zonecode);
                $(addressSelector).val(data.roadAddress);
                $(detailSelector).focus();
            }
        }).open();
    },

    // 감정 색상 반환
    getMoodColor: function(mood) {
        const colorMap = {
            '기쁨': '#a5d6a7',
            '슬픔': '#90caf9',
            '분노': '#ffb7b2',
            '불안': '#ffcc99',
            '후회': '#c9a0dc',
            '희망': '#fff59d',
            '중립': '#bdbdbd',
            '피로': '#b0bec5',
            '우울': '#7986cb'
        };
        return colorMap[mood] || '#bdbdbd';
    },

    // 감정 CSS 클래스 반환
    getMoodClass: function(mood) {
        const classMap = {
            '기쁨': 'mood-joy',
            '희망': 'mood-joy',
            '슬픔': 'mood-sad',
            '우울': 'mood-depression',
            '분노': 'mood-anger',
            '불안': 'mood-anxiety',
            '후회': 'mood-sad',
            '피로': 'mood-sad',
            '중립': ''
        };
        return classMap[mood] || '';
    }
};

// 폼 직렬화 확장 함수
$.fn.serializeObject = function() {
    var obj = {};
    var arr = this.serializeArray();
    arr.forEach(function(data) {
        obj[data.name] = data.value;
    });
    return obj;
};

// 전역으로 노출
window.CommonUtils = CommonUtils;
